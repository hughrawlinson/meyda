---
layout: default
---

# How to compare two audio signals

Comparing signals directly can be tricky, as direct waveform comparisons don't reveal much about the ways in which different sounds are similar or diverge. While direct signal correlation has its uses, the comparison of audio features between signals can more clearly illustrate the relationship between sounds. This guide provides an introduction to the use of audio features in signal comparison.

It's important to highlight that while this guide explains some of the concepts and tradeoffs you'll make when you decide how to compare signals, and that this knowledge can help you make good initial choices, you will likely need to fine tune the way your comparison works to fit your specific goal.

## The "why" of signal comparison

Signal comparison has a wide range of applications in music information retreival, including video games, content recommendation and sequencing, text to speech, and speaker identification to name a just a few. Each use case has its own set of requirements and priorities that affect the optimal comparison to make between signals. For example, in a weighted comparison of the harmonic, timbral, rhythmic, and structural components of 4 minute recordings of songs that might be in use in acoustic-based music recommendation systems, each component of that comparison must be represented and summarised in the data and comparison method. On the other hand, a program that uses signal comparison to listen for a specific sound - think of a home voice assistant whose wake word is set to the sound of a clap - may be able to directly compare timbral features of short buffers without needing to store averages.

## Choosing audio features

Depending on the reason you're comparing two signals, and the content of the signals, you must choose the appropriate audio features to compare. If the content is musical, and you are interested in a comparison of harmonic content, it may be suitable to compare the chroma of the signals, since the chroma audio feature encodes the pitch of the content of the audio. If you're interested in comparing the energy of unpitched low frequency sound, you might choose to first low-pass filter your audio, and then comparing the rms audio feature, or loudness. The timbre of recordings of the human voice might be suitably compared using the Mel-Frequency Cepstral Coefficients (mfcc) feature. If you're interested in comparing the pitched-ness of sounds, you might look to features like spectral kurtosis and spectral flatness.

Choosing the right features to compare is key to the success of your comparison. The Meyda [audio feature guide] divides features into three groups, time domain, spectral, and perceptual. The three time domain features are very computationally cheap and are useful as quick measurements of loudness, and periodicity (and therefore pitchedness). Spectral features delve into the timbre of the sound, and can indicate brightness, noisiness, timbral roughness, pitchedness, and harmonic content. Perceptual features are tuned to statistical analyses of human hearing, and can therefore be good ways to differentiate sounds that humans would perceive as having significant differences. The important thing to remember is that you should compare the attributes sounds that distinguish them in ways that are important for your application.

## How to summarise the audio feature values over time

Once you've chosen your audio features, it's time to consider the duration of the sounds you're comparing, and how that relates to the attributes that are important to your comparison. For example, you may only need to compare extremely short sounds, on which you can easily fit into a single sub-second audio buffer and computationally efficiently extract features on to directly compare. At that point you can compare the numbers, or in the case of certain features, the vectors, and you have your comparison. More often, use cases for signal comparison involve longer sounds, over 500ms in duration, up to minutes, or even hours or more. Each use case has it's own requirements, but most require the collection and possibly summary of audio features.

### Windowing

Meyda and other audio feature extractors solve the problem of extracting features on long audio signals using a technique called windowing. Windowing splits a longer chunk of audio into snippets (called windows) of a specific size (usually a power of two number of individual audio samples) to extract audio on. When the audio is coming in in real time from a microphone this is necessary, since the audio feature can't have access to the entire signal before it's recorded. Windows can overlap for higher resolution feature extraction, or leave gaps when we need to reduce the amount of data we have, depending on the required fidelity in audio feature output. Audio features are then extracted on each window, rather than on the audio file as a whole. This leaves us with *lists* of audio features representing audio at different times in the input signal, rather than individual numbers representing the entire signal. This presents us with a choice in comparison that ties in with our use case: does our signal comparison application care about the *times* during the signal that the audio features arose?

## Direct comparison of audio features

The simple case is that we want to compare a simple summary of the audio features that represent an entire signal, and we do *not* want to highly weight the *duration* of the signal in our comparison. The music recommendation example from above is one instance where this approach might be suitable. In music recommendation systems with a large number of candidate songs, storing the audio features for each tenth-of-a-second clip of each song can get extremely expensive. These systems also tend not to mind so much about the duration of a song, so in this case it can be appropriate to take an average of each feature across the entire song. As long as the same process is applied to each song in the corpus, you are left with a directly comparable set of audio features that represents the overall song. Similar songs (in terms of the chosen audio features) at least, should tend to be close to each other in "feature space". We'll cover feature space and how to do the comparison later on.

### Comparing signals over time

If the timing of acoustic content in the signal is important, in applications where the comparison of rhythm, musical structure, or timbral envelopes are the primary characteristics being compared, an average is not suitable for the use case, since it would destroy the temporal data. If your input signals are all of similar length, you can directly compare the arrays of audio signals. For two arrays of audio features representing each signal, you migth compare them like so:

<iframe src="https://runkit.com/e/oembed-iframe?target=%2Fusers%2Fraw%2Frepositories%2Fsignal-vector-comparison%2Fdefault&referrer=" style="border: 0; width: 100%; height: 40px;" allowfullscreen scrolling="no"></iframe>

_Tip: after running the above example, select "chart" from the properties viewer dropdown to see the difference between the two spectral flatness vectors as a bar chart_

You can see that the second signal starts out with slightly lower spectral flatness than the first, jumps to a significantly higher value than the first, and ends the window with equal spectral flatness.

### Aggregate features representing longer windows 

Bear in mind that the duration each audio feature represents is equal to the duration of the window. In Meyda, this is set using the `bufferSize` property of the Meyda object, which represents the number of samples in each window, and for performance reasons must equal a power of two. Typical buffer sizes vary, and have an impact on the resulting audio features - but typically are extremely short, ranging from 512 to 4096 samples in length. In audio sampled at CD quality (sampled at 44,100hz), 512 samples is just over 1% the duration of a second, and is almost 10% the duration of a second. In audio with higher sample rates, these window sizes represent an even shorter duration of audio. If the change in audio features over time is important in your audio comparison use case, you should consider grouping the audio features themselves into buckets that represent roughly the shortest amount of time you care about and averaging them. In recordings of rhythmic sounds like percussion or machines, this might be a quarter of a second up to about one second, whereas in some ambient music it could ten seconds or longer. In certain circumstances it might make sense (and be possible) to resample the audio such that each window aligns well with the boundaries between changes in audio content. If you can do that, you should get a very good representation of the audio features of each important segment of audio.

Another suggestion for certain use cases might be to split your signal into chunks based on the content of each chunk, i.e. when the sound changes, start a new chunk. You would be able to get highly representative features of each chunk of sound as a human might split it in editing softare. Doing this is well beyond the scope of this guide but if you are interested in more information, please [let us know].

### Resampling features for signal duration normalization

TODO: When you care about the feature envelope but not the actual duration

It may be necessary to resample _the audio features themselves_ in order to perform your comparison. As an example use case, consider 

## How to actually compute the comparison

Once we have chosen our features, and our per recording audio feature aggregation method, we can extract features accordingly for two signals, and compare them. But looking at Javascript arrays in the console doesn't scale. We should implement code to do the comparison. One way that I recommend is to view each recording's set of features as a position in space. Doing so allows us to apply distance formulas like Euclidean distance, and Cosine distance.

You may remember Euclidean distance from mathematics education - if not, don't worry, we have code examples that you can follow, and there is plenty of information about it online.

### Weighting features by importance

You can even change the weights at runtime

### What unit is distance in?

We can say that lower distance scores mean that the signals are more similar, whereas higher distance scores mean the signals have more differences. There isn't really a unit, though. Audio features of mixed units went in, and an opaque number came out. If your chosen features and aggregation methods are suitable for your use case, the number should correlate with the acoustic differences that you care about. We recommend playing around with the chosen features, and tweaking the weighting of features, in order to find the most suitable similarity measure for your specific use case.


# This is probably a separate post but maybe...

## Looking for structural patterns in longer audio signals

### Comparing an audio signal with itself

[audio-feature-guide](../audio-features)
[let us know](https://github.com/meyda/meyda)