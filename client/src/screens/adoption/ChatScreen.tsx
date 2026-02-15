import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { AdoptStackParamList } from '../../navigation/AdoptNavigator';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../auth/AuthContext';
import { Message } from '../../types';

type ChatRouteProp = RouteProp<AdoptStackParamList, 'Chat'>;

const ChatScreen = () => {
    const route = useRoute<ChatRouteProp>();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { chatId, otherUserName } = route.params;

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const unsub = chatService.listenToMessages(chatId, (newMessages) => {
            setMessages(newMessages);
            setLoading(false);
        });
        return unsub;
    }, [chatId]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const text = inputText.trim();
        setInputText('');
        try {
            await chatService.sendMessage(chatId, text);
        } catch (error) {
            console.error('Send message failed:', error);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === user?.uid;
        return (
            <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                    {item.text}
                </Text>
                <Text style={styles.timestamp}>
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.userName}>{otherUserName}</Text>
                    <Text style={styles.status}>Online</Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                inverted
                contentContainerStyle={styles.messageList}
                ListHeaderComponent={loading ? <ActivityIndicator style={{ margin: 20 }} color="#4CAF50" /> : null}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Ionicons name="send" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backBtn: {
        padding: 4,
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    status: {
        fontSize: 12,
        color: '#4CAF50',
    },
    messageList: {
        padding: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 8,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4CAF50',
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#FFF',
    },
    theirMessageText: {
        color: '#333',
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.4)',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingTop: 8,
        maxHeight: 100,
        fontSize: 16,
        marginRight: 12,
        color: '#333',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: '#CCC',
    }
});

export default ChatScreen;
