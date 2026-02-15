import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import { pick, types, keepLocalCopy } from '@react-native-documents/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { animalService } from '../services/animalService';

interface UploadModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const EMOTIONS = ['Happy', 'Angry', 'Lazy', 'Rude', 'Sad', 'Cute'];

const UploadModal: React.FC<UploadModalProps> = ({ visible, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedEmotion, setSelectedEmotion] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const resetForm = () => {
        setName('');
        setDescription('');
        setSelectedEmotion('');
        setImageUri(null);
        setImageBase64(null);
        setAudioUri(null);
        setUploading(false);
    };

    const pickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.6,
                maxWidth: 800,
                maxHeight: 800,
                includeBase64: true,
            });
            if (result.assets && result.assets[0].uri) {
                setImageUri(result.assets[0].uri);
                setImageBase64(result.assets[0].base64 || null);
            }
        } catch (error) {
        }
    };

    const pickAudio = async () => {
        try {
            const [result] = await pick({
                type: [types.audio],
                allowMultiSelection: false,
            });

            const results = await keepLocalCopy({
                files: [{
                    uri: result.uri,
                    fileName: result.name || 'animal_audio.mp3'
                }],
                destination: 'cachesDirectory'
            });

            const copiedFile = results[0];
            if (copiedFile.status === 'success' && copiedFile.localUri) {
                setAudioUri(copiedFile.localUri);
            } else {
                Alert.alert('Audio Error', 'Could not prepare audio file for upload.');
            }
        } catch (err) {
            // Error handled by picker
        }
    };

    const handleSubmit = async () => {
        if (!name || !description || !selectedEmotion || !imageUri || !audioUri) {
            Alert.alert('Missing Fields', 'Please fill all fields and upload both image and audio.');
            return;
        }

        const user = auth().currentUser;

        setUploading(true);
        try {
            await animalService.uploadSubmission({
                name,
                description,
                emotion: selectedEmotion,
                imageUri,
                audioUri,
                imageBase64: imageBase64 || undefined,
            });
            Alert.alert('Success', 'Your animal has been submitted!');
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', `Submission failed: ${error.message || 'Please try again'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>New Animal</Text>
                        <TouchableOpacity onPress={onClose} disabled={uploading}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scroll}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Leo the Lion" />

                        <Text style={styles.label}>Emotion</Text>
                        <View style={styles.chipContainer}>
                            {EMOTIONS.map(emo => (
                                <TouchableOpacity
                                    key={emo}
                                    style={[styles.chip, selectedEmotion === emo && styles.activeChip]}
                                    onPress={() => setSelectedEmotion(emo)}
                                >
                                    <Text style={[styles.chipText, selectedEmotion === emo && styles.activeChipText]}>{emo}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Tell us about this animal..."
                            multiline
                        />

                        <Text style={styles.label}>Media</Text>
                        <View style={styles.mediaRow}>
                            <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                                <Ionicons name="image-outline" size={24} color="#555" />
                                <Text style={styles.mediaText}>{imageUri ? 'Image Selected' : 'Add Image'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.mediaButton} onPress={pickAudio}>
                                <Ionicons name="musical-note-outline" size={24} color="#555" />
                                <Text style={styles.mediaText}>{audioUri ? 'Audio Selected' : 'Add Audio'}</Text>
                            </TouchableOpacity>
                        </View>

                        {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={uploading}>
                            {uploading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitText}>Submit Animal</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    scroll: {
        paddingBottom: 40,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    activeChip: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
    },
    chipText: {
        color: '#555',
    },
    activeChipText: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    mediaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    mediaButton: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
        borderStyle: 'dashed',
    },
    mediaText: {
        marginTop: 8,
        fontSize: 12,
        color: '#777',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        marginTop: 16,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        marginTop: 32,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
    },
    submitText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default UploadModal;
