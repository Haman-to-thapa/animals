import React, { memo, useRef, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SocialPost } from '../types';

const { width } = Dimensions.get('window');

interface SocialPostCardProps {
    post: SocialPost;
    onLike: (id: string, isNowLiked: boolean) => void;
    onComment: (post: SocialPost) => void;
    onReport: (id: string) => void;
    isAdmin?: boolean;
    onDelete?: (id: string) => void;
}

const SocialPostCard = memo(({ post, onLike, onComment, onReport, isAdmin, onDelete }: SocialPostCardProps) => {
    const scale = useRef(new Animated.Value(1)).current;
    const fadeOut = useRef(new Animated.Value(1)).current;

    const handleLikePress = () => {
        const isCurrentlyLiked = !!post.isLiked;

        Animated.sequence([
            Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
        ]).start();

        onLike(post.id, !isCurrentlyLiked);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.authorRow}>
                    {post.authorPhoto ? (
                        <Image source={{ uri: post.authorPhoto }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={16} color="#888" />
                        </View>
                    )}
                    <View>
                        <Text style={styles.authorName}>{post.authorName || 'Anonymous'}</Text>
                        <View style={[styles.badge, { backgroundColor: getEmotionColor(post.emotion) }]}>
                            <Text style={styles.badgeText}>{post.emotion}</Text>
                        </View>
                    </View>
                </View>

                {isAdmin ? (
                    <TouchableOpacity onPress={() => onDelete && onDelete(post.id)}>
                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => onReport(post.id)}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            <Image
                source={{ uri: post.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Text style={styles.petName}>{post.name}</Text>
                <Text style={styles.description}>{post.description}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleLikePress}>
                    <Animated.View style={{ transform: [{ scale }] }}>
                        <Ionicons
                            name={post.isLiked ? "heart" : "heart-outline"}
                            size={26}
                            color={post.isLiked ? "#E91E63" : "#555"}
                        />
                    </Animated.View>
                    <Text style={[styles.actionText, post.isLiked && { color: '#E91E63', fontWeight: 'bold' }]}>
                        {post.likes || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => onComment(post)}>
                    <Ionicons name="chatbubble-outline" size={22} color="#555" />
                    <Text style={styles.actionText}>
                        {post.commentCount || 0}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const getEmotionColor = (emotion: string) => {
    const colors: any = {
        Happy: '#FFD700',
        Angry: '#FF4444',
        Lazy: '#9E9E9E',
        Rude: '#FF6B6B',
        Sad: '#4A90E2',
        Cute: '#FF99CC'
    };
    return colors[emotion] || '#4CAF50';
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 }
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 2,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    postImage: {
        width: width,
        height: width,
        backgroundColor: '#F5F5F5',
    },
    content: {
        padding: 12,
        paddingBottom: 6,
    },
    petName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 28,
    },
    actionText: {
        marginLeft: 6,
        color: '#555',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default SocialPostCard;
