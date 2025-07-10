<template>
  <v-footer
    app
    color="transparent"
    class="text-center"
  >
    <v-container>
      <v-row>
        <v-col cols="12">
          <p class="text-body-2 text-grey">
            © {{ currentYear }} WhatsApp Mass Sender - 
            Desarrollado con ❤️ usando Vue.js & Node.js
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>