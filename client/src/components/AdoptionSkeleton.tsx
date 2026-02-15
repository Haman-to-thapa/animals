import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonItem = () => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.image, { opacity }]} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Animated.View style={[styles.line, { width: 80, opacity }]} />
                    <Animated.View style={[styles.line, { width: 30, opacity }]} />
                </View>
                <Animated.View style={[styles.line, { width: 100, marginTop: 8, opacity }]} />
                <View style={[styles.footer, { marginTop: 12 }]}>
                    <Animated.View style={[styles.line, { width: 60, height: 10, opacity }]} />
                    <Animated.View style={[styles.line, { width: 40, height: 10, opacity }]} />
                </View>
            </View>
        </View>
    );
};

const AdoptionSkeleton = () => (
    <View style={styles.container}>
        <View style={styles.row}>
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonItem key={i} />)}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        width: width * 0.44,
        marginHorizontal: width * 0.02,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#E1E9EE',
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    line: {
        height: 14,
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});

export default AdoptionSkeleton;
