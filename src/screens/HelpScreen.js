import React, {
  useState,
} from 'react';

import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import MenuModuleLayout from '../components/MenuModuleLayout';
import colors from '../theme/colors';

const FAQ_ITEMS = [
  {
    question:
      'Como ficar online?',
    answer:
      'Na tela inicial, toque no botão FICAR ONLINE. O GPS e a internet precisam estar ativos.',
  },
  {
    question:
      'Como aceitar uma corrida?',
    answer:
      'Quando uma entrega aparecer, confira os dados e toque em aceitar. A corrida será reservada para você.',
  },
  {
    question:
      'Como recebo meus ganhos?',
    answer:
      'Cadastre sua chave Pix, acesse a Carteira e solicite o saque quando atingir o valor mínimo.',
  },
  {
    question:
      'O que fazer se o cliente não responder?',
    answer:
      'Permaneça no local e entre em contato com a Central Operacional antes de cancelar ou abandonar a entrega.',
  },
];

export default function HelpScreen({
  navigation,
}) {
  const [openIndex, setOpenIndex] =
    useState(null);

  async function openEmail() {
    await Linking.openURL(
      'mailto:suporte@chinafast.com.br?subject=Ajuda%20ChinaFast'
    );
  }

  return (
    <MenuModuleLayout
      navigation={navigation}
      title="Ajuda"
      subtitle="Dúvidas frequentes e suporte"
    >
      <Text style={styles.sectionTitle}>
        Perguntas frequentes
      </Text>

      {FAQ_ITEMS.map(
        (item, index) => {
          const open =
            openIndex === index;

          return (
            <Pressable
              key={item.question}
              style={styles.faqCard}
              onPress={() =>
                setOpenIndex(
                  open
                    ? null
                    : index
                )
              }
            >
              <View style={styles.questionRow}>
                <Text style={styles.question}>
                  {item.question}
                </Text>

                <Text style={styles.symbol}>
                  {open
                    ? '−'
                    : '+'}
                </Text>
              </View>

              {open ? (
                <Text style={styles.answer}>
                  {item.answer}
                </Text>
              ) : null}
            </Pressable>
          );
        }
      )}

      <Pressable
        style={styles.emailButton}
        onPress={openEmail}
      >
        <Text style={styles.emailIcon}>
          ✉️
        </Text>

        <View style={styles.emailContent}>
          <Text style={styles.emailTitle}>
            Enviar e-mail ao suporte
          </Text>

          <Text style={styles.emailSubtitle}>
            suporte@chinafast.com.br
          </Text>
        </View>
      </Pressable>
    </MenuModuleLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },

  faqCard: {
    padding: 17,
    borderRadius: 17,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    marginBottom: 11,
  },

  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  question: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    paddingRight: 12,
  },

  symbol: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: '700',
  },

  answer: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 13,
  },

  emailButton: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 17,
    backgroundColor:
      colors.primary,
    marginTop: 14,
  },

  emailIcon: {
    fontSize: 24,
  },

  emailContent: {
    flex: 1,
    marginLeft: 13,
  },

  emailTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  emailSubtitle: {
    color:
      'rgba(255,255,255,0.80)',
    fontSize: 12,
    marginTop: 4,
  },
});
