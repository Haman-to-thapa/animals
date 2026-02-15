import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { animalService } from '../services/animalService';
import AnimalCard from '../components/AnimalCard';
import AnimalCardSkeleton from '../components/AnimalCardSkeleton';
import UploadModal from '../components/UploadModal';
import { Animal } from '../types';

const EMOTIONS = ['All', 'Happy', 'Angry', 'Lazy', 'Rude', 'Sad', 'Cute'];


interface FilterChipProps {
  item: string;
  filter: string;
  onPress: (item: string) => void;
}

const FilterChip = memo(({ item, filter, onPress }: FilterChipProps) => {
  const isActive = filter === item;
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isActive && styles.activeFilter
      ]}
      onPress={() => onPress(item)}
    >
      <Text style={[
        styles.filterText,
        isActive && styles.activeFilterText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );
});


interface ListHeaderProps {
  filter: string;
  onFilterPress: (item: string) => void;
}

const ListHeader = memo(({ filter, onFilterPress }: ListHeaderProps) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Welcome to Animal 🐾</Text>
      <FlatList
        horizontal
        data={EMOTIONS}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <FilterChip
            item={item}
            filter={filter}
            onPress={onFilterPress}
          />
        )}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        initialNumToRender={7}
      />
    </View>
  );
});


const CenterAnimalImage = memo(() => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <View style={styles.centerImageContainer}>
      <View style={styles.imageWrapper}>
        {!imageLoaded && (
          <ActivityIndicator
            size="small"
            color="#4CAF50"
            style={styles.imageLoader}
          />
        )}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=500' }}
          style={styles.centerImage}
          onLoad={() => setImageLoaded(true)}
          progressiveRenderingEnabled={true}
          fadeDuration={300}
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.imageCaption}>Family</Text>
          <Text style={styles.subCaption}>Show your dog sound & picture</Text>
        </View>
      </View>
    </View>
  );
});

function HomeScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);


  const animalsCount = useMemo(() => animals.length, [animals]);

  const fetchAnimals = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setPermissionError(false);

    try {
      const result = await animalService.getAnimals(
        filter,
        reset ? null : lastDoc
      );

      setAnimals(prev => reset ? result.animals : [...prev, ...result.animals]);
      setLastDoc(result.lastDoc);
    } catch (error: any) {

      if (error.code === 'firestore/permission-denied') {
        setPermissionError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, lastDoc, loading]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLastDoc(null);
    fetchAnimals(true);
  }, [fetchAnimals]);

  useEffect(() => {
    setAnimals([]);
    setLastDoc(null);
    fetchAnimals(true);
  }, [filter]);

  const handlePlay = useCallback((id: string) => {
    setCurrentPlayingId(id);
  }, []);

  const handlePause = useCallback(() => {
    setCurrentPlayingId(null);
  }, []);

  const handleFilterPress = useCallback((emotion: string) => {
    setFilter(emotion);
  }, []);

  const handleEndReached = useCallback(() => {
    if (lastDoc && !loading) {
      fetchAnimals(false);
    }
  }, [lastDoc, loading, fetchAnimals]);

  const handleUploadSuccess = useCallback(() => {
    fetchAnimals(true);
  }, [fetchAnimals]);


  const renderAnimalCard = useCallback(({ item }: { item: any }) => (
    <AnimalCard
      animal={item}
      isPlaying={currentPlayingId === item.id}
      onPlay={handlePlay}
      onPause={handlePause}
    />
  ), [currentPlayingId, handlePlay, handlePause]);


  const listHeaderComponent = useMemo(() => (
    <>
      <ListHeader filter={filter} onFilterPress={handleFilterPress} />
      <CenterAnimalImage />
    </>
  ), [filter, handleFilterPress]);

  const listFooterComponent = useMemo(() => (
    loading && animalsCount > 0 ? (
      <ActivityIndicator color="#4CAF50" style={styles.footerLoader} />
    ) : null
  ), [loading, animalsCount]);

  const listEmptyComponent = useMemo(() => (
    !loading && !permissionError ? (
      <View style={styles.emptyContainer}>
        <Ionicons name="paw-outline" size={64} color="#CCC" />
        <Text style={styles.emptyText}>No animals found for this category.</Text>
        <Text style={styles.emptySubText}>Try another emotion or add new one!</Text>
      </View>
    ) : null
  ), [loading, permissionError]);

  if (loading && animalsCount === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(item) => `skeleton-${item}`}
          renderItem={() => <AnimalCardSkeleton />}
          ListHeaderComponent={listHeaderComponent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setUploadVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }

  if (permissionError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="lock-closed" size={64} color="#F44336" />
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>
          Cannot access the database. Security rules need to be configured.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchAnimals(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />

      <FlatList
        data={animals}
        keyExtractor={item => item.id}
        renderItem={renderAnimalCard}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={listFooterComponent}
        ListEmptyComponent={listEmptyComponent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}


        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={true}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}


        refreshing={refreshing}
        onRefresh={handleRefresh}


        updateCellsBatchingPeriod={50}
        disableVirtualization={false}
        pagingEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setUploadVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <UploadModal
        visible={uploadVisible}
        onClose={() => setUploadVisible(false)}
        onSuccess={handleUploadSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F9',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 12,
  },
  footerLoader: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    elevation: 2,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  filterContainer: {
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#FFF',
    marginRight: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeFilter: {
    backgroundColor: '#4CAF50',
    elevation: 2,
  },
  filterText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFF',
  },
  centerImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    width: '100%',
    height: 160,
  },
  centerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  imageCaption: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subCaption: {
    color: '#EEE',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
    zIndex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

export default memo(HomeScreen);