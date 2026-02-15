import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
}

const ReportModal = ({ visible, onClose, onSubmit }: ReportModalProps) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) return;
        setLoading(true);
        try {
            await onSubmit(reason);
            setReason('');
            onClose();
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Report Post</Text>
                    <Text style={styles.subtitle}>Why are you reporting this content?</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Describe the issue..."
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitBtn, !reason.trim() && styles.disabled]}
                            onPress={handleSubmit}
                            disabled={!reason.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.submitText}>Report</Text>
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
        borderRadius: 12,
        padding: 24,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 12,
        textAlignVertical: 'top',
        height: 100,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginRight: 10,
    },
    cancelText: {
        color: '#777',
        fontWeight: 'bold',
    },
    submitBtn: {
        backgroundColor: '#F44336',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    submitText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    disabled: {
        backgroundColor: '#FFCDD2',
    }
});

export default ReportModal;
