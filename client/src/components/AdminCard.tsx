import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface AdminCardProps {
    item: any;
    activeTab: string;
    onAction: (item: any, action: 'approve' | 'reject' | 'delete' | 'ban') => void;
    onIgnore?: (id: string) => void;
}

const AdminCard = ({ item, activeTab, onAction, onIgnore }: AdminCardProps) => {
    const isUser = activeTab === 'users';
    const imageUri = isUser
        ? (item.photoURL || item.imageUrl || null)
        : (item.imageUrl || item.petImageUrl || (item.imageBase64 ? `data:image/jpeg;base64,${item.imageBase64}` : null));

    return (
        <View style={styles.card}>
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.cardImage} />
            ) : (
                <View style={[styles.cardImage, styles.placeholder]}>
                    <Text style={{ fontSize: 40 }}>{isUser ? '👤' : '📄'}</Text>
                </View>
            )}
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {isUser ? (item.displayName || 'Anonymous User') : (item.name || item.petName || 'Reported Content')}
                </Text>

                {isUser ? (
                    <>
                        <Text style={styles.cardText} numberOfLines={1}>{item.email || 'No Email'}</Text>
                        <Text style={styles.cardText}>Role: {item.role || 'User'}</Text>
                    </>
                ) : (
                    <Text style={styles.cardText} numberOfLines={1}>
                        By: {item.authorName || item.ownerName || item.reportedBy || 'Unknown'}
                    </Text>
                )}

                <Text style={[styles.cardStatus, item.status === 'banned' && { color: 'red' }]}>
                    Status: {item.status || 'Active'}
                </Text>

                {item.reason && <Text style={styles.cardReason} numberOfLines={2}>Reason: {item.reason}</Text>}

                <View style={styles.actions}>


                    {isUser ? (
                        item.status !== 'banned' && (
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => onAction(item, 'ban')} style={[styles.btn, styles.deleteBtn, { backgroundColor: '#FF9800' }]}>
                                    <Text style={styles.btnText}>Ban</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onAction(item, 'delete')} style={[styles.btn, styles.deleteBtn]}>
                                    <Text style={styles.btnText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => onAction(item, 'delete')} style={[styles.btn, styles.deleteBtn]}>
                                <Text style={styles.btnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {activeTab === 'reports' && onIgnore && (
                        <TouchableOpacity onPress={() => onIgnore(item.id)} style={[styles.btn, styles.ignoreBtn]}>
                            <Text style={styles.btnText}>Ignore</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12, overflow: 'hidden', flexDirection: 'row', elevation: 2 },
    cardImage: { width: 100, height: 100 },
    placeholder: { backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
    cardContent: { flex: 1, padding: 12 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardText: { fontSize: 13, color: '#666', marginTop: 2 },
    cardStatus: { fontSize: 12, color: '#4CAF50', marginTop: 4, fontWeight: '600' },
    cardReason: { fontSize: 11, color: '#E53935', marginTop: 4, fontStyle: 'italic' },
    actions: { flexDirection: 'row', marginTop: 8 },
    btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8 },
    approveBtn: { backgroundColor: '#4CAF50' },
    deleteBtn: { backgroundColor: '#E53935' },
    ignoreBtn: { backgroundColor: '#999' },
    btnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
});

export default memo(AdminCard);
