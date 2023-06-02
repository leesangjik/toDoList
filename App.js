import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./color";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const HEADER_KEY = "@header";

export default function App() {
  const [working, setWorking] = useState();
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const work = () => setWorking(true);
  const travel = () => setWorking(false);

  const onChangeText = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    try {
      const s = JSON.stringify(toSave);
      await AsyncStorage.setItem(STORAGE_KEY, s);
    } catch (error) {
      console.log(error);
    }
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadToDos(), [];
  });

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete to do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
    return;
  };

  const saveWorkingMode = async () => {
    try {
      if (working !== undefined) {
        const workingMode = {
          Mode: working,
        };
        await AsyncStorage.setItem(HEADER_KEY, JSON.stringify(workingMode));
        //console.log(`Save working mode : ${working}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    saveWorkingMode();
  }, [working]);

  const loadWorkingMode = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys.includes(HEADER_KEY)) {
        const savedMode = await AsyncStorage.getItem(HEADER_KEY);
        const savedModeValue = JSON.parse(savedMode).Mode;
        setWorking(savedModeValue);
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadWorkingMode();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: working === false ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        style={styles.input}
        placeholder={
          working === undefined
            ? "Select either tap"
            : working
            ? "What do you have to do"
            : "Where do you want to go"
        }
        editable={working !== undefined ? true : false}
      ></TextInput>

      <ScrollView>
        {toDos
          ? Object.keys(toDos).map((key) =>
              toDos[key].working === working ? (
                <View style={styles.toDo} key={key}>
                  <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  <View style={styles.icons}>
                    <TouchableOpacity>
                      <Text style={styles.icon}>
                        <Fontisto name="check" size={16} color={theme.grey} />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        deleteToDo(key);
                      }}
                    >
                      <Text style={styles.icon}>
                        <Fontisto name="trash" size={16} color={theme.grey} />
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            )
          : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 44,
    fontWeight: 600,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 20,
    fontSize: 15,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: 500,
  },
  icons: {
    flexDirection: "row",
  },
  icon: {
    paddingHorizontal: 5,
  },
});
