<template>
  <div class="error" v-if="hasError">
    <Error :errorMessage="errorMessage"></Error>
  </div>
  <Suspense v-else>
    <template #default>
      <Layout>
        <router-view v-if="!hasError" />
      </Layout>
    </template>
    <template #fallback>
      <div class="loading">now loading...</div>
    </template>
  </Suspense>
</template>

<script lang="ts">
import { defineComponent, onErrorCaptured, ref } from "vue";
import { isErrorObj } from "~/usecases/error";
import Error from "~/components/errro.vue";
import Layout from "~/templates/Layout.vue";

export default defineComponent({
  name: "App",
  components: { Error, Layout },
  setup: () => {
    const hasError = ref(false);
    const errorMessage = ref("");
    onErrorCaptured((error) => {
      hasError.value = true;
      if (isErrorObj(error)) {
        errorMessage.value = error.message ?? "";
      }
    });
    return { hasError, errorMessage };
  },
});
</script>

<style scoped lang="scss">
@import "~/scss/main.scss";

.loading {
  @include center-asolute;
  opacity: 0.5;
}
</style>
