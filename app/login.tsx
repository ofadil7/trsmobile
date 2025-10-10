import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@/store';
import { loginSchema, type LoginSchema } from '@/store/features/authentification/auth-schemas';
import { login } from '@/store/features/authentification/authSlice';
import { Label } from '@react-navigation/elements';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { styles } from '../constants/Styles';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

// Custom Zod resolver for React Native
const zodResolver = (schema: any) => (data: any) => {
  const result = schema.safeParse(data);
  if (result.success) return { values: result.data, errors: {} };

  const errors: any = {};
  result.error.errors.forEach((err: any) => {
    errors[err.path[0]] = { type: err.code, message: err.message };
  });
  return { values: {}, errors };
};

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  const onSubmitLogin = async (data: LoginSchema) => {
    await dispatch(login(data)).then(() => {
      router.replace('/');
    });
  };

  const renderInput = (
    label: string,
    placeholder: string,
    control: any,
    name: string,
    secure?: boolean,
    icon?: React.ReactElement,
  ) => (
    <View style={styles.inputGroup}>
      <Label style={styles.label}>{label}</Label>
      <View style={styles.inputWrapper}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Controller
          control={control.control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder={placeholder}
              secureTextEntry={secure}
              value={value}
              onChangeText={onChange}
              style={[styles.input, icon && styles.inputWithIcon]}
            />
          )}
        />
      </View>
      {control.formState.errors[name] && (
        <Text style={styles.errorText}>{control.formState.errors[name]?.message}</Text>
      )}
    </View>
  );

  const renderCheckbox = (label: string, control: any, name: string) => (
    <View style={styles.checkboxContainer}>
      <Controller
        control={control.control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Checkbox value={value} onValueChange={onChange} style={styles.checkbox} />
        )}
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.logoContainer, isTablet && styles.tabletLogoContainer]}>
          <Image
            source={{ uri: 'http://trs.optimizehealthsolutions.ma/assets/trs-logo-CqWuv3a1.png' }}
            style={[styles.logo, isTablet && styles.tabletLogo]}
            resizeMode='contain'
          />
          <Text style={[styles.title]}>TRS</Text>
          <Text style={[styles.subtitle]}>Solution de brancarderie</Text>
        </View>

        <View style={[styles.formContainer, isTablet && styles.tabletFormContainer]}>
          <Text style={styles.formTitle}>Connectez-vous à votre compte</Text>

          {renderInput(
            "Nom d'utilisateur",
            "Entrez votre nom d'utilisateur",
            loginForm,
            'username',
            false,
            <Ionicons name='person-outline' size={20} color='#c2c3cd' />,
          )}

          {renderInput(
            'Mot de passe',
            'Entrez votre mot de passe',
            loginForm,
            'password',
            true,
            <Ionicons name='lock-closed-outline' size={20} color='#c2c3cd' />,
          )}

          {renderCheckbox('Se souvenir de moi', loginForm, 'rememberMe')}

          {error && (
            <Text style={styles.errorText}>
              {typeof error === 'string' ? error : 'Une erreur est survenue'}
            </Text>
          )}

          <Button
            onPress={loginForm.handleSubmit(onSubmitLogin)}
            disabled={loading}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
