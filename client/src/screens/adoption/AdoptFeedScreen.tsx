import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, RefreshControl, ActivityIndicator, Platform, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdoptStackParamList } from '../../navigation/AdoptNavigator';
import { adoptionService } from '../../services/adoptionService';
import { Adoption } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import AdoptionCard from '../../components/AdoptionCard';
import AdoptionSkeleton from '../../components/AdoptionSkeleton';

type AdoptNavigationProp = NativeStackNavigationProp<AdoptStackParamList>;

const AdoptFeedScreen = () => {
    const navigation = useNavigation<AdoptNavigationProp>();
    const { user, profile } = useAuth();
    const [adoptions, setAdoptions] = useState<Adoption[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastDoc, setLastDoc] = useState<any>(null);

    const fetchAdoptions = useCallback(async (reset = false) => {
        if (loading) return;
        setLoading(true);
        if (reset && !refreshing) setInitialLoading(true);

        try {
            const result = await adoptionService.getAdoptions(reset ? null : lastDoc);
            setAdoptions(prev => reset ? result.adoptions : [...prev, ...result.adoptions]);
            setLastDoc(result.lastDoc);
        } catch (error: any) {
            console.error('Fetch adoptions error:', error);
            Alert.alert('Error', `Failed to load pets: ${error.message}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setInitialLoading(false);
        }
    }, [lastDoc, loading, refreshing]);

    useEffect(() => {
        fetchAdoptions(true);
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAdoptions(true);
    }, [fetchAdoptions]);

    const handleLoadMore = useCallback(() => {
        if (lastDoc && !loading) {
            fetchAdoptions(false);
        }
    }, [lastDoc, loading, fetchAdoptions]);

    const renderItem = useCallback(({ item }: { item: Adoption }) => (
        <AdoptionCard
            adoption={item}
            isOwner={item.ownerId === user?.uid}
            onPress={(adoption) => navigation.navigate('AdoptionDetail', { adoption })}
        />
    ), [user, navigation]);

    const header = useMemo(() => (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>Adopt a Friend</Text>
                <Text style={styles.headerSubtitle}>Find your perfect companion</Text>
            </View>
            <View style={styles.headerActions}>
                {(profile?.role === 'admin' || user?.email?.includes('admin')) && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AdminAdoption')}
                        style={styles.adminBtn}
                    >
                        <Ionicons name="shield-checkmark-outline" size={22} color="#4CAF50" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={() => navigation.navigate('ChatList')}
                    style={styles.headerBtn}
                >
                    <Ionicons name="chatbubbles-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    ), [user, profile, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {header}

            {initialLoading ? (
                <AdoptionSkeleton />
            ) : (
                <FlatList
                    data={adoptions}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#4CAF50']}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={loading && adoptions.length > 0 ? (
                        <ActivityIndicator style={{ margin: 20 }} color="#4CAF50" />
                    ) : null}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="paw-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>No pets available for adoption right now.</Text>
                            <TouchableOpacity
                                style={styles.retryBtn}
                                onPress={() => fetchAdoptions(true)}
                            >
                                <Text style={styles.retryText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    // Performance optimizations for low-end devices
                    removeClippedSubviews={Platform.OS === 'android'}
                    initialNumToRender={6}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddAdoption')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
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
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminBtn: {
        marginRight: 12,
        padding: 4,
    },
    headerBtn: {
        padding: 4,
    },
    listContent: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120, // Space for FAB
    },
    row: {
        justifyContent: 'space-between', // Evenly space the 2 columns
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 16,
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
    },
    retryText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 90, // Above tab bar
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    }
});

export default AdoptFeedScreen;
