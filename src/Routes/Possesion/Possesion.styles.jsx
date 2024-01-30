import { StyleSheet, Dimensions } from 'react-native';
import Constants from '../../Variables/colors.variables';
const { width, height } = Dimensions.get('window');
const Styles = StyleSheet.create({
  contentSection: {
    padding: 24,
    backgroundColor: Constants.appBackgroundColor,
  },
  map: {
    width: '100%',
    height: '40%',
  },
  outerSection: {
    flex: 1,
  },
  inputFields: {
    marginVertical: 10,
  },
  buttonSection: {
    marginTop: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 6,
    padding: 20,
  },
  name: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: 'Poppins-Regular',
    color: Constants.headingColor,
  },
  orderId: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
    color: Constants.activeInputColor,
  },
  orderIdNumber: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: 'Poppins-Regular',
    color: Constants.primaryColor,
  },
  createdAt: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: Constants.activeInputColor,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    height: 600,
    width: width - 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default Styles;
