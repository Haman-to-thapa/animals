import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

const AnimalCardSkeleton = () => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, [opacity]);

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.imageContainer, { opacity }]} />

            <View style={styles.info}>
                <Animated.View style={[styles.textLine, { width: '70%', height: 16, marginBottom: 10, opacity }]} />

                <View style={styles.authorRow}>
                    <Animated.View style={[styles.avatar, { opacity }]} />
                    <Animated.View style={[styles.textLine, { width: '40%', height: 12, opacity }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: Platform.OS === 'android' ? 0 : 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    imageContainer: {
        height: CARD_HEIGHT,
        backgroundColor: '#E0E0E0',
    },
    info: {
        padding: 14,
        backgroundColor: '#FFF',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E0E0E0',
        marginRight: 6,
    },
    textLine: {
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
});

export default AnimalCardSkeleton;
