import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
//import for camera permission
import { CameraView, useCameraPermissions, CameraType, FlashMode } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  //Permission
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, requestMediaLibraryPermission] = useState<
    boolean | null
  >(false);
  const [image, setImage] = useState<string | null>(null);
  //camera reference
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      requestMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    };
    requestPermission();
  }, []);

  useEffect(() => {
    console.log('cameraPermission:', cameraPermission);
    console.log('hasMediaLibraryPermission:', hasMediaLibraryPermission);
    console.log('isCameraReady:', isCameraReady);
  }, [cameraPermission, hasMediaLibraryPermission, isCameraReady]);

  useEffect(() => {
    if (cameraPermission && cameraPermission.status !== 'granted') {
      requestCameraPermission();
    }
  }, [cameraPermission]);

  if (!cameraPermission || cameraPermission.status !== 'granted') {
    //Camera permission is still loading
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasMediaLibraryPermission) {
    return (
      <View>
        <Text>Requesting media library permission...</Text>
      </View>
    );
  }

  const handleSaveToGallery = async () => {
    if (image && hasMediaLibraryPermission) {
      try {
        await MediaLibrary.createAssetAsync(image).then(() => {
          setImage(null);
        });
      } catch (err) {}
    }
  };

  const handleSwitchCamera = () => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
  };
  const handleToggleFlash = () => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  if (image) {
    // Have image then show it
    return (
      <View style={styles.container}>
        <Image source={{ uri: image }} style={{ flex: 1, width: "100%" }} />
        <Button title="Retake" onPress={() => setImage(null)} />
        <Button title="Save to Gallery" onPress={handleSaveToGallery} />
        <Button title="Switch Camera" onPress={handleSwitchCamera} />
        <Button title={flash === 'off' ? "Turn Flash On" : "Turn Flash Off"} onPress={handleToggleFlash} />
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const options = { quality: 1, base64: true, exif: false };
        const newPhoto = await cameraRef.current.takePictureAsync(options);
        setImage(newPhoto.uri);
      } catch (err) {
        console.error(err);
      }
    }
  };

  //no image then show button to take image
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flash}
        onCameraReady={handleCameraReady}
      />
      {/* Preview รูปภาพมุมซ้ายล่าง */}
      {image && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />
        </View>
      )}
      {/* แถบปุ่มด้านล่าง */}
      <View style={styles.bottomBar}>
        {/* ปุ่มแฟลช */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
          disabled={!isCameraReady}
        >
          <Text style={styles.icon}>{flash === 'on' ? '💡' : '⚡️'}</Text>
        </TouchableOpacity>
        {/* ปุ่มถ่ายรูปใหญ่ */}
        <TouchableOpacity
          style={[styles.shutterButton, !isCameraReady && styles.buttonDisabled]}
          onPress={handleTakePicture}
          disabled={!isCameraReady}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>
        {/* ปุ่มสลับกล้อง */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleSwitchCamera}
          disabled={!isCameraReady}
        >
          <Text style={styles.icon}>🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 36,
    paddingBottom: 32,
    backgroundColor: "rgba(0,0,0,0.35)",
    height: 110,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 28,
    color: "#fff",
  },
  shutterButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  previewContainer: {
    position: "absolute",
    left: 24,
    bottom: 130,
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#222",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
