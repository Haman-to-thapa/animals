import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView,
    StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    createdAt: Date;
}

const HelpChatScreen = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your Animal Family assistant. How can I help you today?",
            sender: 'ai',
            createdAt: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            createdAt: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {

            // Replace with your actual backend URL
            const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
                message: userMsg.text
            });



            const replyText = typeof response.data.reply === 'string' ? response.data.reply : 'Received invalid response format.';

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: replyText,
                sender: 'ai',
                createdAt: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                sender: 'ai',
                createdAt: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />


            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Help Assistant</Text>
                    <View style={styles.onlineBadge}>
                        <View style={styles.dot} />
                        <Text style={styles.onlineText}>Online</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask about Animal Family..."
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.disabledButton]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="send" size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 4,
    },
    onlineText: {
        fontSize: 12,
        color: '#888',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    flatList: {
        flex: 1,
    },
    messageList: {
        padding: 16,
        paddingBottom: 24,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#4CAF50',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#FFF',
    },
    aiText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    input: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 15,
        color: '#333',
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCC',
    },
});

export default HelpChatScreen;
