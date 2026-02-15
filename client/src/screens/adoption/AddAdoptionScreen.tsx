import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView, Platform, Modal, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { adoptionService } from '../../services/adoptionService';
import { currencyList } from '../../utils/currencyList';

const AddAdoptionScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [breed, setBreed] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [isFree, setIsFree] = useState(true);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.5,
            includeBase64: true,
        });

        if (result.assets && result.assets[0].uri) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || null);
        }
    };

    const handleSubmit = async () => {
        if (!name || !age || !breed || !location || !description || !imageBase64) {
            Alert.alert('Error', 'Please fill all fields and select an image.');
            return;
        }

        if (!isFree && !price) {
            Alert.alert('Error', 'Please enter a price for paid adoptions.');
            return;
        }

        setLoading(true);
        try {
            await adoptionService.createAdoption({
                petName: name,
                petAge: age,
                petBreed: breed,
                location: location,
                petDescription: description,
                isFree,
                price: isFree ? 0 : parseFloat(price),
                currency: isFree ? 'USD' : currency
            }, imageBase64);

            Alert.alert('Success', 'Your pet is now listed and visible to everyone! 🐾', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to create listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>List a Pet</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="camera-outline" size={48} color="#4CAF50" />
                            <Text style={styles.placeholderText}>Select Pet Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={styles.label}>Pet Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Bella"
                        value={name}
                        onChangeText={setName}
                    />

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { marginRight: 8 }]}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 2 years"
                                value={age}
                                onChangeText={setAge}
                            />
                        </View>
                        <View style={[styles.inputContainer, { marginLeft: 8 }]}>
                            <Text style={styles.label}>Breed</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Golden Retriever"
                                value={breed}
                                onChangeText={setBreed}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Adoption Fee</Text>
                    <View style={styles.radioContainer}>
                        <TouchableOpacity
                            style={[styles.radioBtn, isFree && styles.radioBtnActive]}
                            onPress={() => { setIsFree(true); setPrice(''); }}
                        >
                            <Ionicons name={isFree ? "radio-button-on" : "radio-button-off"} size={20} color={isFree ? "#4CAF50" : "#666"} />
                            <Text style={[styles.radioText, isFree && styles.radioTextActive]}>Free Adoption</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.radioBtn, !isFree && styles.radioBtnActive]}
                            onPress={() => setIsFree(false)}
                        >
                            <Ionicons name={!isFree ? "radio-button-on" : "radio-button-off"} size={20} color={!isFree ? "#4CAF50" : "#666"} />
                            <Text style={[styles.radioText, !isFree && styles.radioTextActive]}>Sell / Paid</Text>
                        </TouchableOpacity>
                    </View>

                    {!isFree && (
                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { marginRight: 8, flex: 0.4 }]}>
                                <Text style={styles.label}>Currency</Text>
                                <TouchableOpacity
                                    style={styles.currencySelector}
                                    onPress={() => setCurrencyModalVisible(true)}
                                >
                                    <Text style={styles.currencyText}>{currency}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputContainer, { marginLeft: 8 }]}>
                                <Text style={styles.label}>Price</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    )}

                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. New York, NY"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Tell us about the pet..."
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                    />

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.disabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitText}>Create Listing</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={currencyModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Currency</Text>
                            <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={currencyList}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.currencyItem}
                                    onPress={() => {
                                        setCurrency(item.code);
                                        setCurrencyModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.currencyItemText}>{item.code} - {item.name} ({item.symbol})</Text>
                                    {currency === item.code && <Ionicons name="checkmark" size={20} color="#4CAF50" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 20,
    },
    imagePicker: {
        height: 200,
        backgroundColor: '#F9F9F9',
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
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
        color: '#4CAF50',
        fontWeight: '600',
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#333',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    inputContainer: {
        flex: 1,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
        elevation: 2,
    },
    submitText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabled: {
        backgroundColor: '#A5D6A7',
    },
    radioContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    radioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    radioBtnActive: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    radioText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    radioTextActive: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    currencySelector: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    currencyText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    currencyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    currencyItemText: {
        fontSize: 16,
        color: '#333',
    }
});

export default AddAdoptionScreen;
