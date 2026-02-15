import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { socialService } from '../../services/socialService';

import { launchImageLibrary } from 'react-native-image-picker';

const EMOTIONS = ['Happy', 'Angry', 'Lazy', 'Rude', 'Sad', 'Cute'];

interface CreatePostViewProps {
    onBack: () => void;
    onSuccess: () => void;
}

const CreatePostView = ({ onBack, onSuccess }: CreatePostViewProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [emotion, setEmotion] = useState(EMOTIONS[0]);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.7,
                includeBase64: true,
            });

            if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
                setImageUri(result.assets[0].uri);
                setImageBase64(result.assets[0].base64 || null);
            }
        } catch (e) {
        }
    };

    const handleSubmit = async () => {
        if (!name || !description || !imageUri) {
            Alert.alert('Error', 'Please fill all fields and select an image.');
            return;
        }

        setLoading(true);
        try {
            await socialService.createPost(name, emotion, description, imageUri, imageBase64);
            onSuccess();
        } catch (error) {
            Alert.alert('Error', 'Upload failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>New Post</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="camera-outline" size={40} color="#88C0AE" />
                            <Text style={styles.placeholderText}>Tap to select photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>Pet Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Fluffy"
                />

                <Text style={styles.label}>Emotion</Text>
                <View style={styles.emotionContainer}>
                    {EMOTIONS.map(e => (
                        <TouchableOpacity
                            key={e}
                            style={[styles.emotionChip, emotion === e && styles.activeEmotion]}
                            onPress={() => setEmotion(e)}
                        >
                            <Text style={[styles.emotionText, emotion === e && styles.activeEmotionText]}>{e}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Tell us about this moment..."
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.disabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitText}>Post Now</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 16,
    },
    imagePicker: {
        height: 200,
        backgroundColor: '#F5F9F8',
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0F2F1',
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 8,
        color: '#88C0AE',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    emotionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    emotionChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 8,
        marginBottom: 8,
    },
    activeEmotion: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    emotionText: {
        color: '#666',
        fontSize: 12,
    },
    activeEmotionText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    submitBtn: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabled: {
        backgroundColor: '#A5D6A7',
    }
});

export default CreatePostView;
