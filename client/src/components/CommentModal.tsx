import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SocialPost, Comment } from '../types';
import { socialService } from '../services/socialService';

interface CommentModalProps {
    visible: boolean;
    post: SocialPost | null;
    onClose: () => void;
}

const CommentModal = ({ visible, post, onClose }: CommentModalProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (visible && post) {
            const unsubscribe = socialService.subscribeToComments(post.id, (updatedComments) => {
                setComments(updatedComments);
            });
            return () => unsubscribe();
        } else {
            setComments([]);
        }
    }, [visible, post]);

    const handleSend = async () => {
        if (!newComment.trim() || !post) return;

        const text = newComment.trim();
        setNewComment('');
        setLoading(true);

        try {
            await socialService.postComment(post.id, text);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 500);
        } catch (error: any) {


        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            {item.authorPhoto ? (
                <Image source={{ uri: item.authorPhoto }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={12} color="#888" />
                </View>
            )}
            <View style={styles.bubble}>
                <Text style={styles.author}>{item.authorName}</Text>
                <Text style={styles.text}>{item.text}</Text>
            </View>
        </View>
    );

    if (!post) return null;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Comments</Text>
                    <View style={{ width: 24 }} />
                </View>

                <FlatList
                    ref={flatListRef}
                    data={comments}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
                        </View>
                    }
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !newComment.trim() && styles.disabledSend]}
                        onPress={handleSend}
                        disabled={!newComment.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="send" size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    closeBtn: {
        padding: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    bubble: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 12,
        borderTopLeftRadius: 2,
        flex: 1,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 }
    },
    author: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 2,
    },
    text: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
        marginRight: 10,
        color: '#333',
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledSend: {
        backgroundColor: '#BDBDBD',
    },
    empty: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
    }
});

export default CommentModal;
