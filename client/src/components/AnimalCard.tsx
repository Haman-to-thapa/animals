import React, { useState, useRef, memo, useCallback, useMemo, useEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet,
    ActivityIndicator, Dimensions, Platform
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import { Animal } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

interface AnimalCardProps {
    animal: Animal;
    isPlaying: boolean;
    onPlay: (id: string) => void;
    onPause: () => void;
}

const emotionColors = {
    Happy: '#FFD700',
    Angry: '#FF4444',
    Lazy: '#9E9E9E',
    Rude: '#FF6B6B',
    Sad: '#4A90E2',
    Cute: '#FF99CC',
    Default: '#4CAF50'
};

const AnimalCard: React.FC<AnimalCardProps> = memo(({ animal, isPlaying, onPlay, onPause }) => {
    const [loadingAudio, setLoadingAudio] = useState(false);
    const [audioPath, setAudioPath] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const videoRef = useRef<any>(null);

    const emotionColor = useMemo(() =>
        emotionColors[animal.emotion as keyof typeof emotionColors] || emotionColors.Default,
        [animal.emotion]
    );

    const imageSource = useMemo(() => {
        if (animal.imageUrl) {
            return { uri: animal.imageUrl };
        }
        if (animal.imageBase64) {
            const uri = animal.imageBase64.startsWith('data:')
                ? animal.imageBase64
                : `data:image/jpeg;base64,${animal.imageBase64}`;
            return { uri };
        }
        return null;
    }, [animal.imageUrl, animal.imageBase64]);

    const handlePlayPress = useCallback(async () => {
        if (isPlaying) {
            onPause();
            return;
        }

        if (animal.audioUrl) {
            onPlay(animal.id);
            return;
        }

        if (animal.audioBase64) {
            setLoadingAudio(true);
            const fileName = `audio_${animal.id}.mp3`;
            const path = `${RNFS.CachesDirectoryPath}/${fileName}`;

            try {
                const exists = await RNFS.exists(path);
                if (!exists) {
                    const base64Data = animal.audioBase64.replace(/^data:.*?;base64,/, '');
                    await RNFS.writeFile(path, base64Data, 'base64');
                }
                setAudioPath(path);
                onPlay(animal.id);
            } catch (err) {
                // Audio load failed
            } finally {
                setLoadingAudio(false);
            }
        }
    }, [animal.id, animal.audioBase64, animal.audioUrl, isPlaying, onPlay, onPause]);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(true);
    }, []);

    const handleVideoEnd = useCallback(() => {
        onPause();
        setAudioPath(null);
    }, [onPause]);

    const handleVideoError = useCallback(() => {
        setLoadingAudio(false);
        onPause();
        setAudioPath(null);
    }, [onPause]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioPath) {
                RNFS.unlink(audioPath).catch(() => { });
            }
        };
    }, [audioPath]);

    return (
        <View style={styles.card}>
            <View style={[styles.imageContainer, { backgroundColor: emotionColor + '20' }]}>
                {imageSource && !imageError ? (
                    <>
                        {!imageLoaded && (
                            <View style={[styles.image, styles.imageLoader]}>
                                <ActivityIndicator color={emotionColor} size="small" />
                            </View>
                        )}
                        <Image
                            source={imageSource}
                            style={styles.image}
                            resizeMode="cover"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            progressiveRenderingEnabled={true}
                            fadeDuration={300}
                        />
                    </>
                ) : (
                    <View style={[styles.image, styles.placeholder]}>
                        <Ionicons name="paw" size={32} color={emotionColor + '40'} />
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.playOverlay,
                        isPlaying && styles.playingOverlay
                    ]}
                    onPress={handlePlayPress}
                    activeOpacity={0.7}
                >
                    {loadingAudio ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <View style={styles.playButton}>
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={24}
                                color="#FFF"
                            />
                        </View>
                    )}
                </TouchableOpacity>

                <View style={[styles.badge, { backgroundColor: emotionColor }]}>
                    <Text style={styles.badgeText}>{animal.emotion}</Text>
                </View>
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{animal.name}</Text>

                <View style={styles.authorRow}>
                    {animal.authorPhoto ? (
                        <Image
                            source={{ uri: animal.authorPhoto }}
                            style={styles.authorAvatar}
                            fadeDuration={200}
                        />
                    ) : (
                        <View style={styles.authorAvatarPlaceholder}>
                            <Ionicons name="person" size={12} color="#999" />
                        </View>
                    )}
                    <Text style={styles.authorName} numberOfLines={1}>
                        {animal.authorName || 'Anonymous'}
                    </Text>
                </View>
            </View>

            {isPlaying && (audioPath || animal.audioUrl) && (
                <Video
                    ref={videoRef}
                    source={{ uri: animal.audioUrl || `file://${audioPath}` }}
                    paused={false}
                    playInBackground={false}
                    playWhenInactive={false}
                    ignoreSilentSwitch="ignore"
                    onLoad={() => setLoadingAudio(false)}
                    onEnd={handleVideoEnd}
                    onError={handleVideoError}
                    bufferConfig={{
                        minBufferMs: 15000,
                        maxBufferMs: 50000,
                        bufferForPlaybackMs: 2500,
                        bufferForPlaybackAfterRebufferMs: 5000
                    }}
                />
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
        shadowRadius: 8,
        elevation: 3,
        borderWidth: Platform.OS === 'android' ? 0 : 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    imageContainer: {
        height: CARD_HEIGHT,
        position: 'relative',
        backgroundColor: '#F5F5F5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    playingOverlay: {
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    info: {
        padding: 14,
        backgroundColor: '#FFF',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 6,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    authorAvatarPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    authorName: {
        fontSize: 12,
        color: '#666',
        flex: 1,
        letterSpacing: 0.2,
    },
});

AnimalCard.displayName = 'AnimalCard';

export default AnimalCard;