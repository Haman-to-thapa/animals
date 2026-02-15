import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { socialService } from '../../services/socialService';
import { SocialPost } from '../../types';
import SocialPostCard from '../../components/SocialPostCard';

const AdminReportView = ({ onBack }: { onBack: () => void }) => {
    const [reports, setReports] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await socialService.getReportedPosts();
            setReports(data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (postId: string) => {
        Alert.alert(
            "Delete Post",
            "Are you sure? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const post = reports.find(r => r.id === postId);
                        setReports(prev => prev.filter(p => p.id !== postId));

                        try {
                            if (post) {
                                await socialService.deletePost(postId);
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Delete failed');
                            loadReports();
                        }
                    }
                }
            ]
        );
    };

    const handleIgnore = async (postId: string) => {
        setReports(prev => prev.filter(p => p.id !== postId));
        try {
            await socialService.ignoreReport(postId);
        } catch (e) {
            loadReports();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Reported Posts</Text>
                <TouchableOpacity onPress={loadReports}>
                    <Ionicons name="refresh" size={24} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            <View style={styles.reportBadge}>
                                <Text style={styles.reportText}>Reports: {item.reportCount}</Text>
                                <TouchableOpacity onPress={() => handleIgnore(item.id)}>
                                    <Text style={styles.ignoreText}>Ignore</Text>
                                </TouchableOpacity>
                            </View>
                            <SocialPostCard
                                post={item}
                                onLike={() => { }}
                                onComment={() => { }}
                                onReport={() => { }}
                                isAdmin={true}
                                onDelete={handleDelete}
                            />
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No reported posts. Good job!</Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFF',
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    itemContainer: {
        marginBottom: 20,
    },
    reportBadge: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFEBEE',
        padding: 10,
        alignItems: 'center',
    },
    reportText: {
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    ignoreText: {
        color: '#1976D2',
        fontWeight: 'bold',
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: '#888',
        fontSize: 16,
    }
});

export default AdminReportView;
