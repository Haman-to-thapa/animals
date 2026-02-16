import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Animal } from '../types';

interface AnimalDetailModalProps {
    visible: boolean;
    animal: Animal | null;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

const emotionColors = {
    Happy: '#FFD700',
    Angry: '#FF4444',
    Lazy: '#9E9E9E',
    Rude: '#FF6B6B',
    Sad: '#4A90E2',
    Cute: '#FF99CC',
    Default: '#4CAF50'
};

const AnimalDetailModal = ({ visible, animal, onClose }: AnimalDetailModalProps) => {
    if (!animal) return null;

    const emotionColor = emotionColors[animal.emotion as keyof typeof emotionColors] || emotionColors.Default;

    const imageSource = React.useMemo(() => {
        if (animal.imageUrl) {
            return { uri: animal.imageUrl };
        }
        if (animal.imageBase64) {
            const uri = animal.imageBase64.startsWith('data:')
                ? animal.imageBase64
                : `data:image/jpeg;base64,${animal.imageBase64}`;
            return { uri };
        }
        return null;
    }, [animal.imageUrl, animal.imageBase64]);

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={32} color="#FFF" />
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.imageContainer}>
                            {imageSource ? (
                                <Image source={imageSource} style={styles.image} resizeMode="cover" />
                            ) : (
                                <View style={[styles.image, styles.placeholder]}>
                                    <Ionicons name="paw" size={64} color={emotionColor + '40'} />
                                </View>
                            )}
                            <View style={[styles.badge, { backgroundColor: emotionColor }]}>
                                <Text style={styles.badgeText}>{animal.emotion}</Text>
                            </View>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.headerRow}>
                                <Text style={styles.name}>{animal.name}</Text>
                            </View>

                            <View style={styles.authorRow}>
                                {animal.authorPhoto ? (
                                    <Image source={{ uri: animal.authorPhoto }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Ionicons name="person" size={16} color="#888" />
                                    </View>
                                )}
                                <Text style={styles.author}>Posted by {animal.authorName || 'Anonymous'}</Text>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.description}>
                                {animal.description || "No description provided."}
                            </Text>


                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxHeight: '85%',
        backgroundColor: '#FFF',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    imageContainer: {
        height: 250,
        width: '100%',
        position: 'relative',
        backgroundColor: '#F5F5F5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 4,
    },
    badgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 14,
    },
    content: {
        padding: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    author: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#444',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
});

export default AnimalDetailModal;
