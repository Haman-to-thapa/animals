import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, StatusBar, Platform, Alert, ActivityIndicator, FlatList } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../auth/AuthContext';
import { moderationService } from '../services/moderationService';
import { AdminMessage } from '../types';

const ProfileScreen = ({ navigation }: any) => {
  const { user, profile, logout, updateProfile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [messages, setMessages] = useState<AdminMessage[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const unsub = moderationService.getUserMessages(user.uid, (msgs) => {
        setMessages(msgs);
      });
      return unsub;
    }
  }, [user?.uid]);

  const handleUpdatePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.7,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    const base64 = asset.base64;

    if (!base64 || !user) return;

    setUpdating(true);
    try {
      const photoURL = `data:image/jpeg;base64,${base64}`;
      await updateProfile({ photoURL });
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Photo update error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to update profile photo.');
    } finally {
      setUpdating(false);
    }
  };

  const menuItems = [
    {
      id: 'family',
      title: 'My Family',
      subtitle: 'Creations from Home tab',
      icon: 'paw-outline',
      color: '#4CAF50',
      screen: 'MyAnimals'
    },
    {
      id: 'moments',
      title: 'My Moments',
      subtitle: 'Your social posts',
      icon: 'images-outline',
      color: '#E91E63',
      screen: 'MySocialPosts'
    },
    {
      id: 'listings',
      title: 'My Listings',
      subtitle: 'Adoption marketplace',
      icon: 'list-circle-outline',
      color: '#FF9800',
      screen: 'MyListings'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>


        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {(profile?.photoURL || user?.photoURL) ? (
                <Image source={{ uri: (profile?.photoURL || user?.photoURL) as any }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  {updating ? (
                    <ActivityIndicator size="small" color="#4CAF50" />
                  ) : (
                    <Ionicons name="person" size={40} color="#888" />
                  )}
                </View>
              )}
              <TouchableOpacity
                style={styles.editBadge}
                onPress={handleUpdatePhoto}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="camera" size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user?.displayName || 'Animal Lover'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>


        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>My Activities</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>


        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Account</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpChat')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#9C27B015' }]}>
              <Ionicons name="chatbubbles-outline" size={24} color="#9C27B0" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Help & AI Assistant</Text>
              <Text style={styles.menuItemSubtitle}>Ask questions about the app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#4CAF5015' }]}>
              <Ionicons name="shield-text-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Privacy Policy</Text>
              <Text style={styles.menuItemSubtitle}>Data usage and app terms</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>


        {messages.length > 0 && (
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Admin Messages</Text>
            {messages.map((msg) => (
              <TouchableOpacity
                key={msg.id}
                style={[styles.msgItem, !msg.read && styles.unreadMsg]}
                onPress={() => !msg.read && moderationService.markMessageRead(msg.id)}
              >
                <View style={styles.msgHeader}>
                  <Ionicons
                    name={msg.read ? "mail-open-outline" : "mail-unread"}
                    size={20}
                    color={msg.read ? "#999" : "#4CAF50"}
                  />
                  <Text style={styles.msgDate}>
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : ''}
                  </Text>
                </View>
                <Text style={styles.msgText}>{msg.message}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}


        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#F44336" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>


        {(profile?.role === 'admin' || user?.email?.includes('admin')) && (
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Administration</Text>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: '#4CAF5015' }]}
              onPress={() => navigation.navigate('AdoptTab', { screen: 'AdminAdoption' })}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#FFF" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemTitle}>Admin Dashboard</Text>
                <Text style={styles.menuItemSubtitle}>Manage content and reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#E8F5E9',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E8F5E9',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 16,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FEEBEE',
  },
  logoutText: {
    marginLeft: 10,
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: '#AAA',
    fontSize: 12,
    marginTop: 24,
  },
  msgItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  unreadMsg: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  msgDate: {
    fontSize: 10,
    color: '#999',
  },
  msgText: {
    fontSize: 14,
    color: '#333',
  }
});

export default ProfileScreen;
