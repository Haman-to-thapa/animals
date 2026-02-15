import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { AdoptStackParamList } from '../../navigation/AdoptNavigator';
import { adoptionService } from '../../services/adoptionService';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../auth/AuthContext';
import ReportModal from '../../components/ReportModal';
import RequestModal from '../../components/RequestModal';

const { width, height } = Dimensions.get('window');

type AdoptionDetailRouteProp = RouteProp<AdoptStackParamList, 'AdoptionDetail'>;

const AdoptionDetailScreen = () => {
    const route = useRoute<AdoptionDetailRouteProp>();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { adoption } = route.params;

    const [loading, setLoading] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [requestVisible, setRequestVisible] = useState(false);
    const isOwner = user?.uid === adoption.ownerId;

    const handleRequestSubmit = async (message: string) => {
        setLoading(true);
        try {
            await adoptionService.sendAdoptionRequest(adoption.id, adoption.ownerId, message);
            Alert.alert('Success', 'Adoption request sent!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send request.');
        } finally {
            setLoading(false);
        }
    };

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isOwner) {
            const unsubscribe = chatService.getChatsForAdoption(adoption.id, (chats) => {
                let count = 0;
                chats.forEach(chat => {
                    const unread = chat.unreadCounts?.[user?.uid || ''] || 0;
                    count += unread;
                });
                setUnreadCount(count);
            });
            return unsubscribe;
        }
    }, [isOwner, adoption.id, user]);

    const handleChat = async () => {
        setLoading(true);
        try {
            const chat = await chatService.getOrCreateChat(
                adoption.id,
                adoption.ownerId,
                adoption.ownerName,
                null,
                adoption.petName
            );
            (navigation as any).navigate('Chat', {
                chatId: chat.id,
                otherUserName: adoption.ownerName
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to start chat.');
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async (reason: string) => {
        setLoading(true);
        try {
            await adoptionService.reportAdoption(adoption.id, reason);
            Alert.alert('Reported', 'Thank you for your report. We will review this listing.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit report.');
        } finally {
            setLoading(false);
            setReportVisible(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                {!isOwner && (
                    <TouchableOpacity onPress={() => setReportVisible(true)} style={styles.reportBtn}>
                        <Ionicons name="flag-outline" size={22} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <Image source={{ uri: adoption.petImageUrl }} style={styles.image} />

                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <View>
                            <Text style={styles.name}>{adoption.petName}</Text>
                            <Text style={styles.breed}>{adoption.petBreed}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.age}>Age: {adoption.petAge}</Text>
                            {adoption.isFree ? (
                                <Text style={styles.freeBadge}>Free Adoption</Text>
                            ) : (
                                <Text style={styles.price}>{adoption.currency} {adoption.price}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={18} color="#4CAF50" />
                        <Text style={styles.location}>{adoption.location}</Text>
                    </View>

                    {adoption.createdAt && (
                        <View style={styles.dateContainer}>
                            <Ionicons name="time-outline" size={16} color="#999" />
                            <Text style={styles.dateText}>
                                Posted on {new Date(adoption.createdAt.seconds * 1000).toLocaleDateString()}
                            </Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.ownerSection}>
                        <View style={styles.ownerAvatar}>
                            <Text style={styles.ownerInitial}>{adoption.ownerName[0]}</Text>
                        </View>
                        <View>
                            <Text style={styles.ownerLabel}>Posted by</Text>
                            <Text style={styles.ownerName}>{adoption.ownerName}</Text>
                        </View>
                        <View style={styles.flex} />
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{adoption.status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>About {adoption.petName}</Text>
                    <Text style={styles.description}>{adoption.petDescription}</Text>
                </View>
            </ScrollView>



            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.bottomContainer}
            >
                <View style={styles.buttonContainer}>
                    {!isOwner ? (
                        <>
                            <TouchableOpacity
                                style={styles.chatBtn}
                                onPress={handleChat}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
                                <Text style={styles.chatBtnText}>Chat</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.adoptBtn, loading && styles.disabled]}
                                onPress={() => setRequestVisible(true)}
                                activeOpacity={0.7}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.adoptBtnText}>Adopt Now</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.viewMessagesBtn}
                            onPress={() => (navigation as any).navigate('ChatList')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.btnContent}>
                                <Ionicons name="chatbubbles-outline" size={20} color="#FFF" />
                                <Text style={styles.viewMessagesText}>View Messages</Text>
                            </View>
                            {unreadCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>

            <ReportModal
                visible={reportVisible}
                onClose={() => setReportVisible(false)}
                onSubmit={handleReport}
            />
            <RequestModal
                visible={requestVisible}
                onClose={() => setRequestVisible(false)}
                onSubmit={handleRequestSubmit}
                petName={adoption.petName}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 1000,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20, // Add some padding at the bottom
    },
    image: {
        width: width,
        height: width * 0.7,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
        padding: 24,
        marginTop: -30,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: 100, // Extra padding to ensure content doesn't hide behind buttons
    },
    mainInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    breed: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    age: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 4,
    },
    freeBadge: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    location: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 20,
    },
    ownerSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ownerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ownerInitial: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    ownerLabel: {
        fontSize: 12,
        color: '#999',
    },
    ownerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    flex: {
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    chatBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#4CAF50',
        marginRight: 12,
        backgroundColor: '#FFF',
    },
    chatBtnText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    adoptBtn: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    adoptBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabled: {
        backgroundColor: '#A5D6A7',
        opacity: 0.7,
    },
    viewMessagesBtn: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewMessagesText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    badgeContainer: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FF5252',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    }
});

export default AdoptionDetailScreen;