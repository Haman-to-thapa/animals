import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { signInWithGoogle } from '../../auth/googleAuth';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (!error.message?.includes('cancelled')) {
        Alert.alert(
          'Sign In Error',
          'Failed to sign in with Google. Please try again.\n' + (error.message || '')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Animated.View style={[
            styles.headerContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🐾</Text>
            </View>
            <Text style={styles.appName}>Animal Family</Text>
            <Text style={styles.subtitle}>Join the world's most loving pet community</Text>
          </Animated.View>

          <Animated.View style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardInfo}>Sign in securely with your Google account</Text>

            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#4CAF50" />
              ) : (
                <>
                  <View style={styles.gLogoContainer}>
                    <Text style={styles.gLogoText}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              By continuing, you agree to our Terms and Privacy Policy
            </Text>
          </Animated.View>

          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={styles.footerText}>Version 1.0.0 • Premium Care</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2E24', // Deep Forest Green/Emerald Base
  },
  flex: {
    flex: 1,
  },
  bgCircle1: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: '#1B5E20',
    opacity: 0.6,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -height * 0.2,
    left: -width * 0.3,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: '#004D40',
    opacity: 0.4,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoEmoji: {
    fontSize: 32,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    maxWidth: '80%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  gLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gLogoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  googleButtonText: {
    color: '#1A1A1A',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  disclaimer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
