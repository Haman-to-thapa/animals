import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar, RefreshControl, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../auth/AuthContext';
import { socialService } from '../services/socialService';
import { SocialPost } from '../types';
import SocialPostCard from '../components/SocialPostCard';
import CommentModal from '../components/CommentModal';
import ReportModal from '../components/ReportModal';
import SocialSkeleton from '../components/SocialSkeleton';
import CreatePostView from './social/CreatePostView';
import AdminReportView from './social/AdminReportView';

const SocialScreen = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'feed' | 'create' | 'admin'>('feed');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const [activePost, setActivePost] = useState<SocialPost | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const fetchPosts = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    if (reset && !refreshing) setInitialLoading(true);

    try {
      const result = await socialService.getPosts(reset ? null : lastDoc);
      const newPosts = result.posts;
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
      setLastDoc(result.lastDoc);

      // Async batch check for likes to avoid blocking render
      if (user) {
        socialService.batchLikeCheck(newPosts.map(p => p.id)).then(likeMap => {
          setPosts(current => current.map(p =>
            likeMap[p.id] !== undefined ? { ...p, isLiked: likeMap[p.id] } : p
          ));
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, [lastDoc, loading, refreshing]);

  useEffect(() => {
    if (view === 'feed') {
      fetchPosts(true);
    }
  }, [view]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(true);
  }, [fetchPosts]);

  const handleLike = useCallback(async (postId: string, isNowLiked: boolean) => {
    setPosts(current =>
      current.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: isNowLiked,
            likes: isNowLiked ? (p.likes || 0) + 1 : Math.max(0, (p.likes || 1) - 1)
          };
        }
        return p;
      })
    );
    try {
      await socialService.likePost(postId);
    } catch (e) {
    }
  }, []);

  const handleReportSubmit = useCallback(async (reason: string) => {
    if (!reportId) return;
    try {
      await socialService.reportPost(reportId, reason);
      Alert.alert('Reported', 'Thank you for keeping our community safe.');
    } catch (e) {
      Alert.alert('Error', 'Failed to report post.');
    } finally {
      setReportId(null);
    }
  }, [reportId]);

  const renderItem = useCallback(({ item }: { item: SocialPost }) => (
    <SocialPostCard
      post={item}
      onLike={handleLike}
      onComment={setActivePost}
      onReport={setReportId}
    />
  ), [handleLike]);

  const header = useMemo(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Community</Text>
      <View style={styles.headerActions}>
        {user?.email?.includes('admin') && (
          <TouchableOpacity onPress={() => setView('admin')} style={styles.iconBtn}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setView('create')} style={styles.createBtn}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  ), [user, setView]);

  if (view === 'create') return <CreatePostView onBack={() => setView('feed')} onSuccess={() => setView('feed')} />;
  if (view === 'admin') return <AdminReportView onBack={() => setView('feed')} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {header}

      {initialLoading ? (
        <SocialSkeleton />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4CAF50']} />
          }
          onEndReached={() => {
            if (lastDoc && !loading) fetchPosts(false);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && posts.length > 0 ? <ActivityIndicator style={{ margin: 20 }} color="#4CAF50" /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>Be the first to post!</Text>
            </View>
          }
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={5}
          getItemLayout={(data, index) => ({
            length: 480, // Approximate height of SocialPostCard
            offset: 480 * index,
            index,
          })}
        />
      )}

      <CommentModal
        visible={!!activePost}
        post={activePost}
        onClose={() => setActivePost(null)}
      />

      <ReportModal
        visible={!!reportId}
        onClose={() => setReportId(null)}
        onSubmit={handleReportSubmit}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: 16,
  },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  }
});

export default SocialScreen;
