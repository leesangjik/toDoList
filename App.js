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
import { FontAwesome5 } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const HEADER_KEY = "@header";

export default function App() {
  const [working, setWorking] = useState();
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});

  const work = () => setWorking(true);
  const travel = () => setWorking(false);

  const edit = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].edit = true;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);

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
      [Date.now()]: { text, working, state: false, edit: false },
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

  const completeToDo = (key) => {
    const newToDos = { ...toDos };
    if (newToDos[key].state == false) {
      Alert.alert("MENTION", "Are you done?", [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            const newToDos = { ...toDos };
            newToDos[key].state = true;
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    } else {
      Alert.alert("MENTION", "Do you want to cancel the completed task?", [
        { text: "No" },
        {
          text: "Yes",
          onPress: async () => {
            const newToDos = { ...toDos };
            newToDos[key].state = false;
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  const editToDo = async (key) => {
    try {
      if (editText === "") {
        return;
      }
      const newToDos = { ...toDos };
      newToDos[key].text = editText;
      setToDos(newToDos);
      setEditText("");
      newToDos[key].edit = false;
      await saveToDos(newToDos);
    } catch (error) {
      console.log(error);
    }
  };

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
                <View style={styles.toDoBox} key={key}>
                  <View style={styles.toDo}>
                    <Text
                      style={{
                        ...styles.toDoText,
                        color: toDos[key].state ? theme.grey : "white",
                      }}
                    >
                      {toDos[key].text}
                    </Text>
                    <View style={styles.icons}>
                      <TouchableOpacity onPress={async () => edit(key)}>
                        <Text style={styles.icon}>
                          <FontAwesome5
                            name="edit"
                            size={16}
                            color={theme.icon}
                          />
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          completeToDo(key);
                        }}
                      >
                        <Text style={styles.icon}>
                          <FontAwesome5
                            name={toDos[key].state ? "check-square" : "square"}
                            size={16}
                            color={theme.icon}
                          />
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          deleteToDo(key);
                        }}
                      >
                        <Text style={styles.icon}>
                          <FontAwesome5
                            name="trash-alt"
                            size={16}
                            color={theme.icon}
                          />
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {toDos[key].edit ? (
                    <TextInput
                      onSubmitEditing={async () => {
                        editToDo(key);
                      }}
                      placeholder={`Editing.. '${toDos[key].text}'`}
                      onChangeText={onChangeEditText}
                      returnKeyType="done"
                      style={styles.editInput}
                    ></TextInput>
                  ) : null}
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
  editInput: {
    backgroundColor: theme.editInput,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    fontSize: 15,
    width: "60%",
    position: "absolute",
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
    paddingHorizontal: 6,
  },
  toDoBox: {},
});
