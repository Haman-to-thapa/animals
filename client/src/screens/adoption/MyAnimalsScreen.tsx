import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { animalService } from '../../services/animalService';
import { Animal } from '../../types';
import AnimalCard from '../../components/AnimalCard';

const MyAnimalsScreen = ({ navigation }: any) => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

    const fetchMyAnimals = async () => {
        try {
            const data = await animalService.getMyAnimals();
            setAnimals(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyAnimals();
    }, []);

    const handlePlay = useCallback((id: string) => {
        setCurrentPlayingId(id);
    }, []);

    const handlePause = useCallback(() => {
        setCurrentPlayingId(null);
    }, []);

    const renderItem = ({ item }: { item: Animal }) => (
        <View style={styles.cardContainer}>
            <AnimalCard
                animal={item}
                isPlaying={currentPlayingId === item.id}
                onPlay={handlePlay}
                onPause={handlePause}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Family 🐾</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <FlatList
                    data={animals}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="paw-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>You haven't added any family members yet.</Text>
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
        backgroundColor: '#F7F9F9',
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
        padding: 12,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: '48%',
        marginBottom: 16,
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

export default MyAnimalsScreen;
