import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

interface RequestModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (message: string) => Promise<void>;
    petName: string;
}

const RequestModal = ({ visible, onClose, onSubmit, petName }: RequestModalProps) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setLoading(true);
        try {
            await onSubmit(message);
            setMessage('');
            onClose();
        } catch (error) {
            // Error handled in parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Adopt {petName}</Text>
                    <Text style={styles.subtitle}>Introduce yourself to the owner and explain why you're a good fit!</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Type your message here..."
                        multiline
                        numberOfLines={4}
                        value={message}
                        onChangeText={setMessage}
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitBtn, !message.trim() && styles.disabled]}
                            onPress={handleSubmit}
                            disabled={!message.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.submitText}>Send Request</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modal: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 14,
        textAlignVertical: 'top',
        height: 120,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginRight: 8,
    },
    cancelText: {
        color: '#999',
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 140,
        alignItems: 'center',
    },
    submitText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    disabled: {
        backgroundColor: '#A5D6A7',
    }
});

export default RequestModal;
