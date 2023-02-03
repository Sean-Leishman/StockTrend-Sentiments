<script lang='ts'>
    import Particles from "svelte-particles";
    import { onMount } from "svelte";
    import { loadFull } from "tsparticles";
    import { loadTrianglesPreset } from "tsparticles-preset-triangles";

    let ParticlesComponent;

    onMount(async () => {
        const module = await import("svelte-particles");

        ParticlesComponent = module.default;
    });

    let particlesOptions = {
        preset: "triangles",
    }

    let particlesConfig = {
        
        particles: {
            color: {
                value: "#006",
            },
            links: {
                enable: true,
                color: "#006",
            },
            move: {
                enable: true,
            },
        },
        fullScreen: { enable: false }
    };

    let onParticlesLoaded = event => {
        const particlesContainer = event.detail.particles;

        // you can use particlesContainer to call all the Container class
        // (from the core library) methods like play, pause, refresh, start, stop
    };

    let particlesInit = async main => {
        // you can use main to customize the tsParticles instance adding presets or custom shapes
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        
        await loadFull(main);
        //await loadTrianglesPreset(main)
    };
</script>

<svelte:component
    this="{ParticlesComponent}"
    id="tsparticles"
    options="{particlesConfig}"
    on:particlesLoaded="{onParticlesLoaded}"
    particlesInit="{particlesInit}"
/>