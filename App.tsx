import firebase from "firebase/compat";
import { NativeBaseProvider, extendTheme, Center, Box, HStack, Text, View, FormControl, Stack, Input, Container, Button, Icon, Modal, WarningOutlineIcon, Spinner, useToast, Card, ScrollView} from "native-base";
import React, { useEffect, useReducer, useState } from "react";
import { firebaseConfig } from "./firebase/firebase";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const newColorTheme = {
  brand: {
    900: "#8287af",
    800: "#7c83db",
    700: "#b3bef6",
  }
};
const customTheme = extendTheme({ colors: newColorTheme });


export default function App() {

  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [isInvalidForm, setIsInvalidForm] = useState(false);
  const [justSubmited, setJustSubmited] = useState<undefined|boolean>(undefined);
  

  // modal form
  const [stockName, setStockName] = useState('');
  const [toInvest, setToInvest] = useState('');


  // investments
  const [listInvestments, setListInvestments] = useState<any[]>([]);


  const addStock = (ev:any) => {
    setShowModal(true);
  }

  const handleSubmit = async (ev:any) => {
    
    if ( toInvest === "" || stockName === "" ) {
      setIsInvalidForm(true);
      return;
    }

    if ( isInvalidForm ) {
      return;
    }

    setJustSubmited(true);


    try {
      const symbol = stockName.toUpperCase();

      await firebase.firestore()
      .collection("investments")
      .doc(stockName)
      .set({
        stockName: symbol,
        investAmount: toInvest,
        urlTrackDetail: `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`
      });

      setTimeout( async () => {

        setStockName("");
        setToInvest("");

        setShowModal(false);
        setJustSubmited(undefined);
        const querySnapshot = await firebase.firestore().collection("investments").get();
        setListInvestments([...querySnapshot.docs.map( (doc:any) => doc.data())])
      }, 1500);

    } catch ( error ) {
      console.log(error);
      toast.show({
        title: "Error",
        description: "Error while adding stock : " + error
      });

    }


  }

  const getFormValue = (ev:any, field:"toInvest" | "stockName") => {

    setJustSubmited(false);

    if ( field === "toInvest" ) {
      if ( isNaN(ev.nativeEvent.text) ) {
        setIsInvalidForm(true);
      } else {
        setIsInvalidForm(false);
      }
      setToInvest(ev.nativeEvent.text);
    }

    if ( field === "stockName" ) {
      setStockName(ev.nativeEvent.text);
    }
  }
  
  
  useEffect (() => {
    firebase.initializeApp(firebaseConfig);

    const fetchData = async () => {
      try {
        const querySnapshot = await firebase.firestore().collection("investments").get();
        setListInvestments([...querySnapshot.docs.map( (doc:any) => doc.data())])
      } catch ( e ) {
        toast.show({
          title: "Error",
          description: "Error while fetching data : " + e
        });
      }
    }

    fetchData();
  }, []);

  return (
    <NativeBaseProvider theme={customTheme}>

      {/* <View style={styles.container}> */}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.CloseButton style={{marginTop:120}}/>
        <Modal.Content maxWidth="900px">
          <Modal.Header >Stock</Modal.Header>
          <Modal.Body>
            <FormControl isInvalid={isInvalidForm}>
              <Box>
                <Input variant="outline" placeholder="Stock name ( Symbol ) " style={{fontSize:16}} value={stockName}
                onChange={(e:any) => getFormValue(e, "stockName")}/>
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  Must be valid name
                </FormControl.ErrorMessage>
              </Box>
              <Box style={{marginTop:15}}>
                <Input variant="outline" placeholder="To invest" style={{fontSize:16}} value={toInvest}
                onChange={(e:any) => getFormValue(e, "toInvest")}/>
                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                  Must be valid price
                </FormControl.ErrorMessage>
              </Box>
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Box bg={"purple.300"} flex={1}>
              <Button onPress={handleSubmit} isDisabled={isInvalidForm || justSubmited}>
                {
                  justSubmited ? <Spinner></Spinner> : <Text color={"white"}>Confirm</Text>
                }
              </Button>
            </Box>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      <View style={{marginTop: 30}}>


      <LinearGradient colors={['#8EC5FC', '#E0C3FC', '#FF8EF7']}>
        <Box style={{ padding: 20 }}>
            <Center>
              <Text fontSize="4xl" style={{fontWeight:"bold", color:"#fff"}}>STOCK TRACKER</Text>
            </Center>
        </Box>
      </LinearGradient>


      <Box style={{display:"flex", justifyContent: "center", marginTop: 20}}>
        <Button style={{"marginRight": 80, marginLeft: 80}} variant="outline" onPress={addStock} colorScheme="primary">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon as={Ionicons} name="add" color={"blue.900"} size={6}/>
            <Text style={{ fontSize: 16, color: '#3461eb', fontWeight: 'bold', marginLeft: 3 }}>
              STOCK
            </Text>
          </View>
        </Button>
      </Box>
      </View>


    {
      listInvestments.length === 0 ? <Box marginTop={10}>
        <Text textAlign="center" fontSize={"2xl"} style={{fontWeight: "bold"}}>No stock trackers for the moment ...</Text></Box> : 
        <ScrollView style={{marginTop: 25}}>
          {
            listInvestments.map((investElement) => (
                <Box key={investElement.id} marginLeft={2} marginRight={2} marginBottom={2} bg={"purple.200"} padding={4} rounded={"2xl"}>
                  <Text style={{fontSize: 20, fontWeight: "bold"}}>{investElement.stockName}</Text>
                  <Text style={{fontSize: 16, fontWeight: "bold"}}>Invested : {(investElement.investAmount).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} EUR</Text>
                </Box>
            ))
          }
        </ScrollView>
    }



    </NativeBaseProvider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
