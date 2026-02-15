import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdoptStackParamList } from '../../navigation/AdoptNavigator';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../auth/AuthContext';
import { Chat } from '../../types';

type ChatListNavigationProp = NativeStackNavigationProp<AdoptStackParamList>;

const ChatListScreen = () => {
    const navigation = useNavigation<ChatListNavigationProp>();
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = chatService.getChats((updatedChats) => {
            setChats(updatedChats);
            setLoading(false);
        });
        return unsub;
    }, []);

    const renderChatItem = ({ item }: { item: Chat }) => {
        const otherUserId = item.participants.find(id => id !== user?.uid) || '';
        const otherUserName = item.participantNames[otherUserId] || 'Anonymous';
        const otherPhoto = item.participantPhotos[otherUserId];
        const lastMessageText = item.lastMessage?.text || 'No messages yet';

        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => navigation.navigate('Chat', { chatId: item.id, otherUserName })}
            >
                <View style={styles.avatarContainer}>
                    {otherPhoto ? (
                        <Image source={{ uri: otherPhoto }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{otherUserName[0]}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.userName}>{otherUserName}</Text>
                        <Text style={styles.time}>
                            {item.updatedAt?.toDate ? item.updatedAt.toDate().toLocaleDateString() : ''}
                        </Text>
                    </View>
                    <Text style={styles.petName}>About: {item.petName}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>{lastMessageText}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Messages</Text>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={item => item.id}
                    renderItem={renderChatItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="chatbubbles-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>No conversations yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backBtn: {
        padding: 4,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        flexGrow: 1,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    petName: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
        marginBottom: 2,
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#AAA',
    }
});

export default ChatListScreen;
