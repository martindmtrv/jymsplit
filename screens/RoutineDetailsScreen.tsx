import * as React from 'react';
import { Alert, Button, Dimensions, FlatList, SafeAreaView, ScrollView, StyleSheet, TouchableHighlight } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { RootData } from '../data/RootDataContext';
import { Text, View } from '../components/Themed';
import { ExerciseState } from '../data/schemas/ExerciseState';
import { RoutineState } from '../data/schemas/RoutineState';
import { Picker } from '@react-native-community/picker';
import { EXERCISES } from '../data/ExercisesMetaData';
import { TextInput } from 'react-native-gesture-handler';



export default function RoutineDetailsScreen({ route, navigation  }: {route:any, navigation: any}) {
  const [refresh, setRefresh] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [start, setStart] = React.useState(false);
  const [random, setRandom] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const setOptions = Array.from(new Array(10), (v, index) => index+1);
  const repOptions = Array.from(new Array(25), (v, index) => index+1);

  return (
    <RootData.Consumer>
      {(root) => {
        // @ts-ignore
        const routine: RoutineState = root.routines.find((routine) => routine.id === route.params.id);

        if (start && !random) {
          // randomize the reps / sets
          routine.exercises.forEach((exercise) => {
            let newSetsMultiplier;
            const newRepsMultiplier = Math.random() * 0.5 + 0.8;

            const difference = newRepsMultiplier - 1;
            if (difference > 1) {
              newSetsMultiplier = 1 + difference;
            } else {
              newSetsMultiplier = 1 - difference;
            }

            exercise.reps = Math.ceil(exercise.reps * newRepsMultiplier);
            exercise.sets = Math.ceil(exercise.sets * newSetsMultiplier);
          });



          root.saveData();
          setRandom(true);
        }

        const filtered = EXERCISES.filter((value) => value.exercise.includes(search.toLowerCase()) || value.muscle.includes(search.toLowerCase()) );

        return (
        <View style={styles.container}>
          <Text style={styles.title}> {routine.routineDay} Day</Text>
          {!start && (!adding ? <TouchableOpacity style={{backgroundColor: "blue", padding: 8, marginTop: 5, borderRadius: 6}} onPress={() => setAdding(true)}><Text>+ Add New Exercise</Text></TouchableOpacity>
          :
          <TouchableOpacity style={{backgroundColor: "red", padding: 8, marginTop: 5, borderRadius: 6}} onPress={() => setAdding(false)}><Text>Cancel</Text></TouchableOpacity>)}

        {!adding && !start && <TouchableOpacity style={{backgroundColor: "green", padding: 8, marginTop: 5, borderRadius: 6}} onPress={() => 
          (routine === root.routines[root.currentDay] || 
          Alert.alert("Warning", "This is not the day you are supposed to hit today are you sure you'd like to start your split here?",
          [{ text: "Yes", onPress: () => {
            root.currentDay = root.routines.indexOf(routine);
            root.saveData();
            setStart(true);
          }}, {text: "No", onPress: () => null}],
          {cancelable: false}
           ))
            && setStart(true)}><Text>Workout!</Text></TouchableOpacity>
            
        }


          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <SafeAreaView style={styles.container}>
              {adding && <>
              <TextInput placeholder={"Search Exercises"} style={{backgroundColor: "white", width: Dimensions.get('window').width * 0.8, padding: 16}} value={search} onChangeText={(text) => setSearch(text)} />
              <FlatList
                  style={styles.scrollView}
                  data={filtered}
                  renderItem={({item, index, separators}) => 
                  <TouchableOpacity
                    //@ts-ignore
                    key={item.key}
                    onPress={() => {
                      routine.addExercise(new ExerciseState(3, 10, false, EXERCISES.findIndex((exercise) => exercise.exercise === item.exercise)));
                      root.saveData();
                      setRefresh(!refresh);
                      setAdding(false);
                    }}>
                    <View style={styles.box}>
                      <Text style={{fontSize: 25, fontFamily: 'Futura',}}>{item.exercise}</Text>
                      <Text style={{fontSize: 20, fontFamily: 'Futura',}}>{item.muscle}</Text>
                    </View>
                  </TouchableOpacity>}
                  keyExtractor={item => item.exercise}
                />
                </>}
            {!adding && <ScrollView style={styles.scrollView}>
              {routine.exercises.map((item: ExerciseState) => 
              <TouchableOpacity key={item.id} style={styles.box} onPress={()=> console.log(item)}>
                <Text style={{fontSize: 25, fontFamily: 'Futura',}}>{item.getExercise()}</Text>
                <Text style={{fontSize : 20, fontFamily: 'Futura',}}>Sets: {item.sets}</Text>
                { !start && 
                <Picker selectedValue={item.sets} style={styles.picker} onValueChange={(value: any) => {
                  item.sets = parseInt(value);
                  root.saveData();
                  setRefresh(!refresh);
                  }}>
                    {setOptions.map((v) => <Picker.Item key={v} label={`${v}`} value={v} />)}
                  </Picker>}
                <Text style={{fontSize: 20,fontFamily: 'Futura'}}>Reps: {item.reps}</Text>
                {!start && <Picker selectedValue={item.reps} style={styles.picker} onValueChange={(value: any) => {
                  item.reps = parseInt(value);
                  root.saveData();
                  setRefresh(!refresh);
                  }}>
                    {repOptions.map((v) => <Picker.Item key={v} label={`${v}`} value={v} />)}
                  </Picker>}
                </TouchableOpacity>)}
                </ScrollView> }
                {start && <TouchableOpacity onPress={() => {
                    root.currentDay = (root.currentDay + 1) % root.routines.length;
                    root.saveData();
                    setStart(false);
                    navigation.navigate("Home", {refresh: true});
                  }} style={{backgroundColor: "blue", padding: 8, marginTop: 5, borderRadius: 6}}><Text>DONE</Text></TouchableOpacity>}
            </SafeAreaView>
        </View>
        );
      }}
    </RootData.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  picker: {
    height: 45,
    width: 100,
    backgroundColor: "white",
  },
  box: {
    display: 'flex',
    flexDirection: "column",
    alignItems: "center",
    height: 200,
    justifyContent: "center",
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 2,
    marginBottom: 25,
    borderColor: "red",
  },
  routineName: {
    fontSize: 30,
    flexGrow: 0,
  },
  title: {
    paddingTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  scrollView: {
    width: Dimensions.get('window').width*0.8,
    marginVertical: 20,
  },
  text: {
    fontFamily: 'Futura',
    fontSize: 42,
  },
});
