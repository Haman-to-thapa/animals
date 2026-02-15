import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Adoption } from '../types';

const { width } = Dimensions.get('window');

interface MyListingCardProps {
    adoption: Adoption;
    onPress: (adoption: Adoption) => void;
    onDelete: (id: string) => void;
}

const MyListingCard = ({ adoption, onPress, onDelete }: MyListingCardProps) => {
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

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{adoption.petName}</Text>
                    <View style={[
                        styles.statusBadge,
                        adoption.status === 'pending' && styles.statusPendingBadge,
                        adoption.status === 'adopted' && styles.statusAdoptedBadge
                    ]}>
                        <Text style={[
                            styles.statusText,
                            adoption.status === 'pending' && styles.statusPendingText,
                            adoption.status === 'adopted' && styles.statusAdoptedText
                        ]}>
                            {adoption.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={styles.breed} numberOfLines={1}>{adoption.petBreed} • {adoption.petAge}</Text>

                <View style={styles.divider} />

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(adoption.id)}
                >
                    <Ionicons name="trash-outline" size={16} color="#FF5252" />
                    <Text style={styles.deleteText}>Remove Listing</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '48%',
        marginHorizontal: '1%',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#F5F5F5',
    },
    content: {
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 4,
    },
    breed: {
        fontSize: 11,
        color: '#888',
        marginBottom: 10,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#E8F5E9',
    },
    statusPendingBadge: {
        backgroundColor: '#FFF3E0',
    },
    statusAdoptedBadge: {
        backgroundColor: '#EEEEEE',
    },
    statusText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    statusPendingText: {
        color: '#FF9800',
    },
    statusAdoptedText: {
        color: '#9E9E9E',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 8,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        backgroundColor: '#FFEBEE',
        borderRadius: 6,
    },
    deleteText: {
        color: '#FF5252',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
    }
});

export default memo(MyListingCard);
