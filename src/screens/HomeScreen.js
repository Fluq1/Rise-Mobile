import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SPACING } from '../constants/theme';
import { CustomButton } from '../components/CustomComponents';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Camisetas' },
    { id: '2', name: 'Calças' },
    { id: '3', name: 'Jaquetas' },
    { id: '4', name: 'Acessórios' },
    { id: '5', name: 'Calçados' },
  ]);

  const [featuredProducts, setFeaturedProducts] = useState([
    { 
      id: '1', 
      name: 'Camiseta Premium RISE', 
      price: 'R$ 129,90',
      discount: '20%',
      /*image: require('../assets/placeholder.png')*/
    },
    { 
      id: '2', 
      name: 'Jaqueta Urban RISE', 
      price: 'R$ 349,90',
      discount: '15%',
      /*image: require('../assets/placeholder.png')*/
    },
    { 
      id: '3', 
      name: 'Calça Jeans RISE', 
      price: 'R$ 239,90',
      discount: '10%',
      /*image: require('../assets/placeholder.png')*/
    },
  ]);

  const [newArrivals, setNewArrivals] = useState([
    { 
      id: '1', 
      name: 'Moletom Oversize', 
      price: 'R$ 199,90',
      /*image: require('../assets/placeholder.png')*/
    },
    { 
      id: '2', 
      name: 'Tênis Urban', 
      price: 'R$ 399,90',
      /*image: require('../assets/placeholder.png')*/
    },
    { 
      id: '3', 
      name: 'Boné Trucker', 
      price: 'R$ 89,90',
      /*image: require('../assets/placeholder.png')*/
    },
    { 
      id: '4', 
      name: 'Bolsa Premium', 
      price: 'R$ 259,90',
      /*image: require('../assets/placeholder.png')*/
    },
  ]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity style={styles.featuredItem}>
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{item.discount}</Text>
      </View>
      <Image 
        source={item.image} 
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderNewArrivalItem = ({ item }) => (
    <TouchableOpacity style={styles.newArrivalItem}>
      <Image 
        source={item.image} 
        style={styles.newArrivalImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('/Users/heitor/Aulas LOCAL/BOER/outro/appPrimas/assets/logo.webp')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="search" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="heart" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="shopping-bag" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <TouchableOpacity style={styles.banner}>
          <Image 
    /*  source={require('../assets/placeholder.png')} */
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>COLEÇÃO VERÃO 2025</Text>
            <Text style={styles.bannerSubtitle}>Até 40% OFF</Text>
            <View style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>COMPRAR AGORA</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver Tudo</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas da Semana</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver Tudo</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderFeaturedItem}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* New Arrivals */}
        <View style={[styles.sectionContainer, { marginBottom: SPACING.xxl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Novidades</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver Tudo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.newArrivalsGrid}>
            {newArrivals.map((item) => (
              <View key={item.id} style={styles.newArrivalWrapper}>
                {renderNewArrivalItem({ item })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color={COLORS.PRIMARY} />
          <Text style={[styles.navText, styles.activeNavText]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="grid" size={24} color={COLORS.GRAY} />
          <Text style={styles.navText}>Categorias</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="shopping-bag" size={24} color={COLORS.GRAY} />
          <Text style={styles.navText}>Sacola</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color={COLORS.GRAY} />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  logo: {
    height: 36,
    width: 100,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: SPACING.medium,
  },
  banner: {
    width: '100%',
    height: 200,
    marginBottom: SPACING.medium,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: FONTS.SIZES.h2,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.WHITE,
    marginBottom: SPACING.small,
  },
  bannerSubtitle: {
    fontSize: FONTS.SIZES.large,
    fontWeight: FONTS.WEIGHTS.medium,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.medium,
  },
  bannerButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 4,
  },
  bannerButtonText: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: FONTS.SIZES.large,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  viewAllText: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.medium,
    color: COLORS.PRIMARY,
  },
  categoriesList: {
    paddingRight: SPACING.medium,
  },
  categoryItem: {
    backgroundColor: COLORS.GRAY_LIGHT,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 20,
    marginRight: SPACING.small,
  },
  categoryText: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.medium,
    color: COLORS.BLACK,
  },
  productsList: {
    paddingRight: SPACING.medium,
  },
  featuredItem: {
    width: width * 0.4,
    marginRight: SPACING.medium,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.small,
    right: SPACING.small,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 4,
    paddingHorizontal: SPACING.small,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    fontSize: FONTS.SIZES.small,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  productInfo: {
    padding: SPACING.small,
  },
  productName: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.medium,
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: FONTS.SIZES.medium,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.BLACK,
  },
  newArrivalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  newArrivalWrapper: {
    width: '48%',
    marginBottom: SPACING.medium,
  },
  newArrivalItem: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  newArrivalImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
    backgroundColor: COLORS.WHITE,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: FONTS.SIZES.small,
    color: COLORS.GRAY,
    marginTop: 4,
  },
  activeNavText: {
    color: COLORS.PRIMARY,
    fontWeight: FONTS.WEIGHTS.medium,
  },
});

export default HomeScreen;