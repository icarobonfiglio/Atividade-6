import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Image, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import * as Voice from 'expo-voice'; 
import { Audio } from 'expo-av';  

const API_KEY = '860d240af05f1e0def8cda208fc17771';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const MovieSearchApp = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [isListening, setIsListening] = useState(false);

  // Request microphone permissions
  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Microphone permission is required!');
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  useEffect(() => {
    requestPermissions();
    
    // Voice recognition event listeners
    const speechResultsHandler = (e) => {
      const spokenQuery = e.value[0];
      setQuery(spokenQuery);
      fetchMovies(spokenQuery);
      setIsListening(false);
    };

    const speechErrorHandler = (e) => {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    };

    Voice.onSpeechResults = speechResultsHandler;
    Voice.onSpeechError = speechErrorHandler;

    return () => {
      Voice.removeAllListeners();
    };
  }, []);

  // Fetch movies from API
  const fetchMovies = async (searchQuery = query) => {
    if (!searchQuery) return;

    try {
      const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&language=pt-BR`;
      const response = await axios.get(url);
      setMovies(response.data.results);
    } catch (error) {
      console.error('Error fetching movies:', error);
      alert('Erro ao buscar filmes. Verifique sua conexão.');
    }
  };

  // Voice recognition methods
  const startListening = async () => {
    setIsListening(true);
    try {
      await Voice.startListening();
    } catch (error) {
      console.error('Start listening error:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Stop listening error:', error);
      setIsListening(false);
    }
  };

  // Render individual movie item
  const renderMovie = ({ item }) => {
    // Handle missing poster path
    const posterUri = item.poster_path 
      ? `${IMG_BASE_URL}${item.poster_path}` 
      : 'https://via.placeholder.com/300x450.png?text=No+Image';

    return (
      <View style={styles.movieContainer}>
        <Image
          source={{ uri: posterUri }}
          style={styles.movieImage}
          defaultSource={require('./assets/placeholder.png')} // Optional local placeholder
        />
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieOverview} numberOfLines={3}>
          {item.overview || 'Descrição não disponível'}
        </Text>
        <Text style={styles.movieYear}>
          <Text style={styles.boldText}>Ano: </Text>
          {item.release_date ? item.release_date.split('-')[0] : 'N/A'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do filme..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={fetchMovies}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.searchButton]} 
              onPress={fetchMovies}
            >
              <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.voiceButton, 
                isListening && styles.activeVoiceButton
              ]} 
              onPress={isListening ? stopListening : startListening}
            >
              <Text style={styles.buttonText}>
                {isListening ? 'Parar' : 'Falar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovie}
          ListEmptyComponent={() => (
            <Text style={styles.emptyListText}>
              Nenhum filme encontrado
            </Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  input: {
    height: 45,
    borderColor: '#444',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    color: '#fff',
    backgroundColor: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  searchButton: {
    backgroundColor: '#1E90FF',
  },
  voiceButton: {
    backgroundColor: '#FF6347',
  },
  activeVoiceButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  movieContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 15,
  },
  movieImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    marginBottom: 10,
    borderRadius: 8,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  movieOverview: {
    color: '#ddd',
    marginBottom: 5,
  },
  movieYear: {
    color: '#fff',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyListText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default MovieSearchApp;