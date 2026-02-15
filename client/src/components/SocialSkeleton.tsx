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
            <View style={styles.header}>
                <Animated.View style={[styles.avatar, { opacity }]} />
                <View>
                    <Animated.View style={[styles.line, { width: 100, opacity }]} />
                    <Animated.View style={[styles.line, { width: 60, height: 10, marginTop: 4, opacity }]} />
                </View>
            </View>
            <Animated.View style={[styles.image, { opacity }]} />
            <View style={styles.content}>
                <Animated.View style={[styles.line, { width: width * 0.4, opacity }]} />
                <Animated.View style={[styles.line, { width: width * 0.8, marginTop: 8, opacity }]} />
            </View>
        </View>
    );
};

const SocialSkeleton = () => (
    <View style={styles.container}>
        {[1, 2, 3].map(i => <SkeletonItem key={i} />)}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    card: {
        backgroundColor: '#FFF',
        marginBottom: 10,
        paddingBottom: 12,
    },
    header: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E1E9EE',
        marginRight: 10,
    },
    line: {
        height: 14,
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
    },
    image: {
        width: width,
        height: width,
        backgroundColor: '#E1E9EE',
    },
    content: {
        padding: 12,
    }
});

export default SocialSkeleton;
