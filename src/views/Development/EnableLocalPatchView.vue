<script setup lang="ts">
// get url from params
const url = new URLSearchParams(window.location.search).get('url');
console.log('url', url);

if (url) {
    localStorage.setItem('localDatexModuleUrl', url);
}

// redirect to home page
window.location.href = '/';

</script>
