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



const getCurrentPriceWorth = async (symbol:string) => {
  const resp = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`);
  const data = await resp.json();
  const priceOfStock = data.quoteSummary.result[0].price.regularMarketPrice.raw;
  return priceOfStock;
}




export default function App() {


  const addCurrentStockWorth = async ( querySnapshot:QuerySnapshot<DocumentData> ) => {

    let investments = [...querySnapshot.docs.map( (doc:any) => doc.data())];
  
    const updatedList = [...investments]; // Create a copy of the array
    for (let i = 0; i < updatedList.length; i++) {
      const stock = updatedList[i];
      const resp = await fetch(stock.urlTrackDetail);
      const data = await resp.json();
      const currentPriceOfStock = data.quoteSummary.result[0].price.regularMarketPrice.raw;
      updatedList[i] = { ...stock, currentPriceOfStock }; // Update the desired element
    }
  
    setListInvestments(updatedList); // Set the state with the updated copy
  }
  

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

      console.log(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`)
      const priceOfStock = await getCurrentPriceWorth(symbol);

      await firebase.firestore()
      .collection("investments")
      .doc(stockName)
      .set({
        priceOfStock, // when bought
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
        await addCurrentStockWorth(querySnapshot)
      }, 1500);

    } catch ( error ) {
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
        addCurrentStockWorth(querySnapshot)


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
                <Box key={investElement.id} marginLeft={2} marginRight={2} marginBottom={2} padding={1}>
                  <LinearGradient colors={['#A76CF9', '#D196FF', '#FF8EF7']} start={{ x: 0.3, y: 0.3 }} end={{ x: 0.6, y: 1 }}  style={{borderRadius:10,  elevation: 7, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84}}>
                    <Box p={5} > 
                      <Text style={{fontSize: 20, fontWeight: "bold"}} mb={3} mt={1} color={"white"}>{investElement.stockName}</Text>

                      <Box>
                        <Text style={{fontSize: 20, fontWeight: "bold"}} color={"white"} >Invested : {(investElement.investAmount).toLocaleString("fr-FR", { style: "currency", currency: "USD" })}</Text>
                        <Text style={{fontSize: 20, fontWeight: "bold"}} color={"white"} >When worth : {(investElement.priceOfStock).toLocaleString("fr-FR", { style: "currency", currency: "USD" })}</Text>

                      </Box>

                      <Box mt={5}>
                        <Text style={{fontSize: 20, fontWeight: "bold"}} color={"white"} >Current worth : 
                        {investElement.currentPriceOfStock &&
                          (investElement.currentPriceOfStock).toLocaleString("fr-FR", { style: "currency", currency: "USD" })
                        }</Text>
                      </Box>

                    </Box>
                  </LinearGradient>
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
