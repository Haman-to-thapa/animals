import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Adoption } from '../types';

const { width } = Dimensions.get('window');

interface AdoptionCardProps {
    adoption: Adoption;
    onPress: (adoption: Adoption) => void;
    isOwner?: boolean;
}

const AdoptionCard = ({ adoption, onPress, isOwner }: AdoptionCardProps) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(adoption)}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: adoption.petImageUrl }}
                style={styles.image}
                resizeMode="cover"
            />

            {isOwner && (
                <View style={styles.ownerBadge}>
                    <Text style={styles.ownerBadgeText}>Your Listing</Text>
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{adoption.petName}</Text>
                    <Text style={styles.age}>Age: {adoption.petAge}</Text>
                </View>

                <Text style={styles.breed} numberOfLines={1}>{adoption.petBreed}</Text>

                <View style={styles.footer}>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.location} numberOfLines={1}>{adoption.location}</Text>
                    </View>

                    <View style={styles.statusBadge}>
                        <Text style={[
                            styles.statusText,
                            adoption.status === 'pending' && styles.statusPending,
                            adoption.status === 'adopted' && styles.statusAdopted
                        ]}>
                            {adoption.status.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '48%', // Flexible width for 2 columns
        marginHorizontal: '1%', // Small equal spacing
    },
    image: {
        width: '100%',
        height: 160, // Slightly taller for better view
        backgroundColor: '#F5F5F5',
    },
    ownerBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ownerBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    age: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    breed: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    location: {
        fontSize: 11,
        color: '#666',
        marginLeft: 2,
    },
    statusBadge: {
        marginLeft: 4,
    },
    statusText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    statusPending: {
        color: '#FF9800',
    },
    statusAdopted: {
        color: '#9E9E9E',
    }
});

export default memo(AdoptionCard);
