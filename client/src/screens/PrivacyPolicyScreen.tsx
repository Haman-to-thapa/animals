import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PrivacyPolicyScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.updateDate}>Last Updated: February 14, 2026</Text>

                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.text}>
                    Welcome to the Animal Family app ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our specialized social platform for pet adoption and pet lovers. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
                </Text>

                <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                <Text style={styles.text}>
                    We collect information that helps us provide the best experience for you and your pets:
                    {"\n\n"}• <Text style={styles.bold}>Account Information:</Text> When you sign in with Google, we collect your name, email address, and profile photo.
                    {"\n"}• <Text style={styles.bold}>User Content:</Text> We collect the photos, videos, pet details, and adoption listings you create.
                    {"\n"}• <Text style={styles.bold}>Communication:</Text> Messages sent through our chat features, including interactions with our AI Help Assistant.
                </Text>

                <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                <Text style={styles.text}>
                    We use the information we collect to:
                    {"\n\n"}• Facilitate pet adoptions and connect pet owners.
                    {"\n"}• Display your social posts and pet profiles to other users.
                    {"\n"}• Provide customer support via our AI Help Assistant.
                    {"\n"}• Monitor and moderate content to ensure a safe community.
                </Text>

                <Text style={styles.sectionTitle}>4. AI Features & Third-Party Services</Text>
                <Text style={styles.text}>
                    <Text style={styles.bold}>Groq AI:</Text> Our Help Assistant feature utilizes Groq's API to provide instant support. Text you send to the assistant is processed by Groq to generate responses. This data is not used to train their models.
                    {"\n\n"}
                    <Text style={styles.bold}>Firebase:</Text> We use Google Firebase for secure authentication, database storage, and file hosting.
                </Text>

                <Text style={styles.sectionTitle}>5. Data Security</Text>
                <Text style={styles.text}>
                    We implement industry-standard security measures to protect your data. Your personal information is encrypted during transmission and storage. However, no method of transmission over the internet is 100% secure.
                </Text>

                <Text style={styles.sectionTitle}>6. Your Rights & Data Deletion</Text>
                <Text style={styles.text}>
                    You have the right to access, correct, or delete your personal data.
                    {"\n\n"}
                    <Text style={styles.bold}>Request Deletion:</Text> If you wish to delete your account and all associated data, please contact us at the email below. We will process your request within 7 days.
                </Text>

                <Text style={styles.sectionTitle}>7. Contact Us</Text>
                <Text style={styles.text}>
                    If you have questions about this Privacy Policy, please contact us at:
                    {"\n"}
                    <Text style={{ fontWeight: 'bold', color: '#4CAF50' }}>hamanthapa00000@gmail.com</Text>
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Animal Family. All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
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
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    updateDate: {
        fontSize: 14,
        color: '#999',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 24,
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        color: '#555',
        lineHeight: 24,
    },
    footer: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        alignItems: 'center',
    },
    footerText: {
        color: '#AAA',
        fontSize: 12,
    },
    bold: {
        fontWeight: 'bold',
        color: '#333',
    }
});

export default PrivacyPolicyScreen;
