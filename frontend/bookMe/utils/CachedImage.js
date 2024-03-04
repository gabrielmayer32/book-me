import React, { useState, useEffect } from 'react';
import {  StyleSheet, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';

const downloadAndCacheImage = async (imageUrl) => {
    // Here you can either choose to encode the URL but keep the slashes as is,
    // or skip encoding altogether since it's going to be a filename.
    // For this example, let's skip encoding.
    const filename = FileSystem.documentDirectory 
    + encodeURIComponent(imageUrl)
    .replace(/%2F/g, '/')
    .replace(/%3A/g, ':');
      const fileInfo = await FileSystem.getInfoAsync(filename);
    if (!fileInfo.exists) {
      console.log("Downloading image to cache:", filename);
      const download = await FileSystem.downloadAsync(imageUrl, filename);
      console.log("Download complete:", download);
      return download.uri; // Use the local file URI for the Image source
    }
    return filename; // Use the cached file URI if it already exists
  };
  

const CachedImage = ({ sourceUrl, style }) => {
  const [localUri, setLocalUri] = useState(null);
    
  console.log("sourceUrl", sourceUrl);
  console.log("style", style);
  useEffect(() => {
    let isMounted = true;

    const cacheImage = async () => {
      const uri = await downloadAndCacheImage(sourceUrl);
      console.log("uri", uri);
      if (isMounted) {
        setLocalUri(uri);
      }
    };

    cacheImage();

    return () => {
      isMounted = false;
    };
  }, [sourceUrl]);

  const defaultStyle = { width: 100, height: 100, ...style };
  return localUri ? <Image source={{ uri: localUri }} style={styles.activityImage} /> : null;
  };

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  },
});

export default CachedImage;
