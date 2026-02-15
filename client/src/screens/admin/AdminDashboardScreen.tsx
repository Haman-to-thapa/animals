import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getFirestore, collection, getDocs, query, orderBy, limit, startAfter } from '@react-native-firebase/firestore';
import { moderationService } from '../../services/moderationService';
import { useAuth } from '../../auth/AuthContext';
import AdminCard from '../../components/AdminCard';

type TabType = 'animals' | 'social' | 'adopt' | 'reports' | 'users';

interface TabData {
    items: any[];
    lastDoc: any;
    hasMore: boolean;
}

const PAGE_SIZE = 15;

const AdminDashboardScreen = ({ navigation }: any) => {
    const { profile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('animals');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [cache, setCache] = useState<Record<TabType, TabData>>({
        animals: { items: [], lastDoc: null, hasMore: true },
        social: { items: [], lastDoc: null, hasMore: true },
        adopt: { items: [], lastDoc: null, hasMore: true },
        reports: { items: [], lastDoc: null, hasMore: true },
        users: { items: [], lastDoc: null, hasMore: true },
    });

    const fetchData = useCallback(async (tab: TabType, isLoadMore = false) => {
        if (loading || (isLoadMore && !cache[tab].hasMore)) return;

        setLoading(true);
        const db = getFirestore();
        const currentData = cache[tab];

        try {
            let result: any[] = [];
            let lastVisible = null;

            if (tab === 'reports') {
                result = await moderationService.getReports();
            } else if (tab === 'users') {
                // Users need specific query
                let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
                if (isLoadMore && currentData.lastDoc) {
                    q = query(q, startAfter(currentData.lastDoc));
                }
                const snap = await getDocs(q);
                result = snap.docs.map((d: any) => ({ id: d.id, ...d.data(), postType: 'user' }));
                lastVisible = snap.docs[snap.docs.length - 1];
            } else {
                const colName = tab === 'social' ? 'social_posts' : (tab === 'adopt' ? 'adoptions' : 'animals');
                let q = query(
                    collection(db, colName),
                    orderBy('createdAt', 'desc'),
                    limit(PAGE_SIZE)
                );

                if (isLoadMore && currentData.lastDoc) {
                    q = query(q, startAfter(currentData.lastDoc));
                }

                const snap = await getDocs(q);
                result = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
                lastVisible = snap.docs[snap.docs.length - 1];
            }

            setCache(prev => ({
                ...prev,
                [tab]: {
                    items: isLoadMore ? [...prev[tab].items, ...result] : result,
                    lastDoc: lastVisible,
                    hasMore: result.length === PAGE_SIZE
                }
            }));
        } catch (error) {
            console.error('Fetch admin error:', error);
            Alert.alert('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loading, cache]);

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData(activeTab, false);
    }, [activeTab, fetchData]);

    const handleAction = useCallback(async (item: any, action: 'approve' | 'reject' | 'delete' | 'ban') => {
        const ownerId = item.uploadedBy || item.ownerId || item.requesterId || item.id;

        if (activeTab === 'users') {
            if (action === 'ban') {
                setCache(prev => ({
                    ...prev,
                    users: { ...prev.users, items: prev.users.items.map((i: any) => i.id === item.id ? { ...i, status: 'banned', isBlocked: true } : i) }
                }));
                try { await moderationService.banUser(item.id); Alert.alert('Success', 'User banned'); }
                catch (e) { fetchData('users', false); }
            } else if (action === 'delete') {
                setCache(prev => ({
                    ...prev,
                    users: { ...prev.users, items: prev.users.items.filter((i: any) => i.id !== item.id) }
                }));
                try { await moderationService.deleteUser(item.id); Alert.alert('Success', 'User deleted'); }
                catch (e) { fetchData('users', false); }
            }
            return;
        }

        const colMap: any = {
            animals: 'animals',
            animal: 'animals',
            social: 'social_posts',
            adopt: 'adoptions'
        };

        let colName = colMap[activeTab];
        let targetId = item.id;
        let targetOwnerId = ownerId;

        // Special handling for reports tab
        if (activeTab === 'reports') {
            colName = item.postType ? colMap[item.postType] : null;
            targetId = item.postId; // Delete the actual post, not the report (deleteContent cleans reports)
            targetOwnerId = item.ownerId; // Send msg to the post owner, not the reporter
        } else {
            colName = colName || (item.postType ? colMap[item.postType] : null);
        }

        if (!colName) {
            // Alert.alert('Error', `Could not determine collection for type: ${item.postType || activeTab}`);
            return;
        }

        // Optimistic Update
        setCache(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                items: prev[activeTab].items.filter(i => i.id !== item.id)
            }
        }));

        try {
            if (action === 'delete') {
                await moderationService.deleteContent(colName, targetId, targetOwnerId, 'Violation of community guidelines');
            } else {
                await moderationService.updateStatus(colName, targetId, targetOwnerId, action === 'approve' ? 'approved' : 'rejected');
            }
        } catch (error) {
            Alert.alert('Error', 'Action failed, please refresh.');
            fetchData(activeTab, false);
        }
    }, [activeTab, fetchData]);

    const handleIgnore = useCallback(async (id: string) => {
        // Optimistic Update
        setCache(prev => ({
            ...prev,
            reports: {
                ...prev.reports,
                items: prev.reports.items.filter(i => i.id !== id)
            }
        }));

        try {
            await moderationService.ignoreReport(id);
        } catch (error) {
            Alert.alert('Error', 'Failed to ignore report');
            fetchData('reports', false);
        }
    }, [fetchData]);


    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: logout, style: 'destructive' }
        ]);
    };

    const renderItem = useCallback(({ item }: { item: any }) => (
        <AdminCard
            item={item}
            activeTab={activeTab}
            onAction={handleAction}
            onIgnore={activeTab === 'reports' ? handleIgnore : undefined}
        />
    ), [activeTab, handleAction, handleIgnore]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {navigation.canGoBack() && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.headerTitle}>Admin Hub</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleRefresh} style={{ marginRight: 16 }}>
                        <Ionicons name="refresh" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#F44336" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabContainer}>
                {(['animals', 'social', 'adopt', 'reports', 'users'] as TabType[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={cache[activeTab].items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onEndReached={() => fetchData(activeTab, true)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading && cache[activeTab].items.length > 0 ? (
                    <ActivityIndicator style={{ margin: 20 }} color="#4CAF50" />
                ) : null}
                ListEmptyComponent={!loading ? <Text style={styles.empty}>No items found.</Text> : (
                    <ActivityIndicator style={{ marginTop: 50 }} color="#4CAF50" />
                )}
                // Optimizations
                removeClippedSubviews={true}
                initialNumToRender={PAGE_SIZE}
                maxToRenderPerBatch={PAGE_SIZE}
                windowSize={5}
                getItemLayout={(data, index) => ({
                    length: 120, // Approx height of AdminCard
                    offset: 120 * index,
                    index,
                })}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', elevation: 2 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#4CAF50' },
    tabText: { fontSize: 13, color: '#666', fontWeight: '500' },
    activeTabText: { color: '#4CAF50', fontWeight: 'bold' },
    list: { padding: 12, paddingBottom: 50 },
    empty: { textAlign: 'center', marginTop: 100, color: '#999', fontSize: 16 }
});

export default AdminDashboardScreen;
