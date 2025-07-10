<template>
  <v-app>
    <v-main>
      <v-container
        fluid
        fill-height
        class="auth-container"
      >
        <v-row
          align="center"
          justify="center"
          class="fill-height"
        >
          <v-col
            cols="12"
            sm="8"
            md="6"
            lg="4"
            xl="3"
          >
            <transition name="slide-fade" mode="out-in">
              <router-view />
            </transition>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-container {
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  min-height: 100vh;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>