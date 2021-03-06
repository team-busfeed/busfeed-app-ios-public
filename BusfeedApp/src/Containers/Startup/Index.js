import React, { useEffect } from 'react'
import { ActivityIndicator, View, Text, Appearance } from 'react-native'
import { useTheme } from '@/Theme'
import { useDispatch } from 'react-redux'
import InitStartup from '@/Store/Startup/Init'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import tailwind from 'tailwind-rn'

const IndexStartupContainer = () => {
  const { Layout, Gutters, Fonts } = useTheme()

  const { t } = useTranslation()

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(InitStartup.action())
  }, [dispatch])

  const theme = Appearance.getColorScheme()

  return (
    <View style={theme == 'dark' ? [Layout.fillDark, Layout.colCenter] : [Layout.fill, Layout.colCenter]}>
      <Brand />
      <ActivityIndicator size={'large'} style={[Gutters.largeVMargin]} />
      <Text style={theme == 'dark' ? tailwind('text-gray-200') : tailwind('text-gray-800')}>{t('welcome')}</Text>
    </View>
  )
}

export default IndexStartupContainer
