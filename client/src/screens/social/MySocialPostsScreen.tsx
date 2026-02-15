import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { socialService } from '../../services/socialService';
import { SocialPost } from '../../types';
import SocialPostCard from '../../components/SocialPostCard';

const MySocialPostsScreen = ({ navigation }: any) => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyPosts = async () => {
        try {
            const data = await socialService.getMyPosts();
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const handleLike = async (postId: string) => {
        // Basic optimistic update or just refresh
        try {
            await socialService.likePost(postId);
            fetchMyPosts();
        } catch (e) { }
    };

    const renderItem = ({ item }: { item: SocialPost }) => (
        <SocialPostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onComment={() => { }} // Could navigate to comments
            onReport={() => { }}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Moments ✨</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="images-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>You haven't shared any moments yet.</Text>
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
        backgroundColor: '#F7F7F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingBottom: 40,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
    }
});

export default MySocialPostsScreen;
