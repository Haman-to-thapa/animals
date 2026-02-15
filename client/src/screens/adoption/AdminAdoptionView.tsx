import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs } from '@react-native-firebase/firestore';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { adoptionService } from '../../services/adoptionService';
import { Adoption } from '../../types';
import AdoptionCard from '../../components/AdoptionCard';

const AdminAdoptionView = () => {
    const navigation = useNavigation();
    const [items, setItems] = useState<Adoption[]>([]);
    const [cache, setCache] = useState<{ pending: Adoption[], reported: Adoption[] }>({ pending: [], reported: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'reported'>('pending');

    const loadData = useCallback(async (force = false) => {
        if (!force && cache[activeTab].length > 0) {
            setItems(cache[activeTab]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const db = getFirestore();
            const q = query(
                collection(db, 'adoptions'),
                where('status', '==', activeTab === 'pending' ? 'pending' : 'available'),
                activeTab === 'reported' ? where('reportCount', '>', 0) : where('reportCount', '==', 0),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((docSnap: any) => ({
                id: docSnap.id,
                ...docSnap.data()
            })) as Adoption[];
            setItems(data);
            setCache(prev => ({ ...prev, [activeTab]: data }));
        } catch (error) {
            Alert.alert('Error', 'Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, [activeTab, cache]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApprove = async (adoptionId: string) => {
        try {
            await adoptionService.approveAdoption(adoptionId);
            setItems(prev => prev.filter(a => a.id !== adoptionId));
            setCache(prev => ({
                ...prev,
                pending: prev.pending.filter(a => a.id !== adoptionId)
            }));
            Alert.alert('Success', 'Listing approved!');
        } catch (e) {
            Alert.alert('Error', 'Approval failed');
        }
    };

    const handleDelete = async (adoptionId: string) => {
        Alert.alert(
            "Delete Listing",
            "Are you sure you want to remove this pet listing?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await adoptionService.deleteAdoption(adoptionId);
                            setItems(prev => prev.filter(a => a.id !== adoptionId));
                        } catch (e) {
                            Alert.alert('Error', 'Delete failed');
                        }
                    }
                }
            ]
        );
    };

    const handleIgnore = async (adoptionId: string) => {
        try {
            await adoptionService.ignoreAdoptionReport(adoptionId);
            setItems(prev => prev.filter(a => a.id !== adoptionId));
        } catch (e) {
            Alert.alert('Error', 'Action failed');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'reported' && styles.activeTab]}
                    onPress={() => setActiveTab('reported')}
                >
                    <Text style={[styles.tabText, activeTab === 'reported' && styles.activeTabText]}>Reported</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    removeClippedSubviews={Platform.OS === 'android'}
                    initialNumToRender={8}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    getItemLayout={(data, index) => ({
                        length: 220, // Approximate height of card + margin
                        offset: 220 * Math.floor(index / 2),
                        index,
                    })}
                    renderItem={({ item }) => (
                        <View style={styles.cardContainer}>
                            {activeTab === 'reported' && (
                                <View style={styles.reportHeader}>
                                    <Text style={styles.reportCount}>Reports: {item.reportCount}</Text>
                                    <TouchableOpacity onPress={() => handleIgnore(item.id)}>
                                        <Text style={styles.ignoreText}>Ignore</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <AdoptionCard
                                adoption={item}
                                onPress={(a) => {
                                    Alert.alert(
                                        "Admin Action",
                                        "Manage this listing",
                                        activeTab === 'pending' ? [
                                            { text: "View Details", onPress: () => (navigation as any).navigate('AdoptionDetail', { adoption: a }) },
                                            { text: "Approve", onPress: () => handleApprove(a.id) },
                                            { text: "Delete", style: "destructive", onPress: () => handleDelete(a.id) },
                                            { text: "Cancel", style: "cancel" }
                                        ] : [
                                            { text: "View Details", onPress: () => (navigation as any).navigate('AdoptionDetail', { adoption: a }) },
                                            { text: "Delete", style: "destructive", onPress: () => handleDelete(a.id) },
                                            { text: "Cancel", style: "cancel" }
                                        ]
                                    );
                                }}
                            />
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
                            <Text style={styles.emptyText}>No {activeTab} listings.</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        elevation: 2,
    },
    backBtn: { padding: 4 },
    refreshBtn: { padding: 4 },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#4CAF50',
    },
    tabText: {
        fontSize: 14,
        color: '#999',
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#4CAF50',
    },
    listContent: {
        padding: 8,
    },
    row: {
        justifyContent: 'flex-start',
    },
    cardContainer: {
        marginBottom: 16,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FFEBEE',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginHorizontal: 8,
        bottom: -10,
        zIndex: 1,
    },
    reportCount: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#D32F2F',
    },
    ignoreText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1976D2',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 16,
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
    }
});

export default AdminAdoptionView;
