import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdoptStackParamList } from '../../navigation/AdoptNavigator';
import { adoptionService } from '../../services/adoptionService';
import { Adoption } from '../../types';
import MyListingCard from '../../components/MyListingCard';

type MyListingsNavigationProp = NativeStackNavigationProp<AdoptStackParamList>;

const MyListingsScreen = () => {
    const navigation = useNavigation<MyListingsNavigationProp>();
    const [adoptions, setAdoptions] = useState<Adoption[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const myAdoptions = await adoptionService.getMyAdoptions();
            setAdoptions(myAdoptions);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteAdoption = async (id: string) => {
        Alert.alert(
            'Delete Listing',
            'Are you sure you want to remove this pet listing?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adoptionService.deleteAdoption(id);
                            fetchData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete listing.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Listings</Text>
                <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={24} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <View style={styles.content}>
                    <FlatList
                        data={adoptions}
                        renderItem={({ item }) => (
                            <MyListingCard
                                adoption={item}
                                onPress={(a) => navigation.navigate('AdoptionDetail', { adoption: a })}
                                onDelete={handleDeleteAdoption}
                            />
                        )}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>You haven't listed any pets yet.</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>
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
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backBtn: { padding: 4 },
    refreshBtn: { padding: 4 },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 8,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        justifyContent: 'flex-start',
    },
    empty: {
        flex: 1,
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});

export default MyListingsScreen;
