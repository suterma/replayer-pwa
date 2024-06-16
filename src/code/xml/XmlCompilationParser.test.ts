/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { expect, describe, it } from 'vitest';
import CompilationParser from './XmlCompilationParser';
import { Compilation } from '@/store/Compilation';
import { DefaultPlaybackRate, DefaultTrackVolume, Track } from '@/store/Track';
import type { ICue } from '@/store/ICue';
import type { ITrack } from '@/store/ITrack';

describe('XmlCompilationParser.ts', () => {
    it('should parse an empty compilation when the compilation is empty', async () => {
        //Arrange
        const str = new Blob(
            [
                `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <XmlCompilation xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        </XmlCompilation>`,
            ],
            {
                type: 'text/plain',
            },
        );

        //Act
        const compilation = await CompilationParser.handleAsXmlCompilation(str);

        //Assert
        expect(compilation).toBeDefined();
        expect(compilation.Tracks).toHaveLength(0);
    });

    it('should parse a full compilation', async () => {
        //Arrange

        const str = new Blob(
            [
                `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <XmlCompilation xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <Id>863b2f9a-f7eb-4e60-8e7a-0aca014f6737</Id>
          <MediaPath/>
          <Title>Willkomme dehei - Junior 2024</Title>
          <Artist/>
          <Album/>
          <Tracks>
            <Track>
              <Id>96cc2214-5370-4c1c-8437-b25b91af72ef</Id>
              <Artist/>
              <PreRoll>4.035</PreRoll>
              <Name>1. Party Party</Name>
              <Album/>
              <Url>01.mp3</Url>
              <Meter>
                <TimeSignature>
                  <Numerator>4</Numerator>
                  <Denominator>4</Denominator>
                </TimeSignature>
                <BeatsPerMinute>119</BeatsPerMinute>
                <OriginTime>0</OriginTime>
              </Meter>
              <UseMeasureNumbers/>
              <Volume>0.5</Volume>
              <Cues>
                <Cue>
                  <Id>22666d08-4400-40a2-bf6b-fc9e30b998be</Id>
                  <Description>Intro</Description>
                  <Shortcut>10</Shortcut>
                  <Time>2.018</Time>
                </Cue>
                <Cue>
                  <Id>5fac1944-4d55-46ca-a824-4cacbc53e8b4</Id>
                  <Description> Intro Album</Description>
                  <Shortcut>11</Shortcut>
                  <Time>34.287</Time>
                </Cue>
              </Cues>
            </Track>
            <Track>
              <Id>848c5309-4152-4f75-a0bc-58f56a76dc2a</Id>
              <Artist/>
              <PreRoll>5.518</PreRoll>
              <Name>2. Wäg vo dehei</Name>
              <Album/>
              <Url>02.mp3</Url>
              <Meter>
                <TimeSignature>
                  <Numerator>2</Numerator>
                  <Denominator>4</Denominator>
                </TimeSignature>
                <BeatsPerMinute>87</BeatsPerMinute>
                <OriginTime>0</OriginTime>
              </Meter>
              <UseMeasureNumbers>true</UseMeasureNumbers>
              <Volume>0.5</Volume>
              <Cues>
                <Cue>
                  <Id>b3669b51-224b-4589-837d-7372f2ac17dc</Id>
                  <Description>Intro</Description>
                  <Shortcut>20</Shortcut>
                  <Time>3.07</Time>
                </Cue>
                <Cue>
                  <Id>9f8714fe-a964-4f02-9148-cd62f35a2f21</Id>
                  <Description>Chorus (1)</Description>
                  <Shortcut>22</Shortcut>
                  <Time>23.449</Time>
                </Cue>
                <Cue>
                  <Id>1b54dd4f-6594-4824-a20a-a729a0294c65</Id>
                  <Description>Interlude (3)</Description>
                  <Shortcut>28</Shortcut>
                  <Time>176.553</Time>
                </Cue>
              </Cues>
            </Track>
          </Tracks>
          <PlaybackMode>PlayTrack</PlaybackMode>
        </XmlCompilation>`,
            ],
            {
                type: 'text/plain',
            },
        );
        //Act
        const compilation = await CompilationParser.handleAsXmlCompilation(str);

        //Assert
        expect(compilation).toBeDefined();
        expect(compilation.Tracks).toHaveLength(2);
        const firstTrack = compilation.Tracks[0];
        expect(firstTrack.Cues).toHaveLength(2);
        expect(firstTrack.Artist).toBeFalsy(); // it's empty
        expect(firstTrack.Album).toBeFalsy(); // it's empty
        expect(firstTrack.Name).toBe('1. Party Party');
        expect(firstTrack.Url).toBe('01.mp3');
        const meter = firstTrack.Meter;
        expect(meter).toBeDefined();
        expect(meter?.TimeSignature).toBeDefined();
        expect(meter?.TimeSignature?.Numerator).toBe(4);
        expect(meter?.BeatsPerMinute).toBe(119);
        expect(meter?.OriginTime).toBe(0);
    });

    it('should provide the playhead position', async () => {
        //Arrange
        const str = new Blob(
            [
                `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <XmlCompilation xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <Id>30c291f0-825c-40ca-a772-b17cdda8f937</Id>
          <MediaPath/>
          <Title>test</Title>
          <Artist/>
          <Album/>
          <Tracks>
            <Track>
              <Id>4dbf78b7-0133-495f-8f71-de69708a9da6</Id>
              <Artist/>
              <PreRoll/>
              <PlayheadPosition>12.7</PlayheadPosition>
               <Name>test</Name>
              <Album/>
              <Url>test.mp3</Url>
              <Meter/>
              <UseMeasureNumbers/>
              <Volume>0.5</Volume>
              <Cues/>
            </Track>
          </Tracks>
          <PlaybackMode>PlayTrack</PlaybackMode>
        </XmlCompilation>        `,
            ],
            {
                type: 'text/plain',
            },
        );

        //Act
        const compilation = await CompilationParser.handleAsXmlCompilation(str);

        //Assert
        expect(compilation).toBeDefined();
        expect(compilation.Tracks).toHaveLength(1);
        const firstTrack = compilation.Tracks[0];
        expect(firstTrack.PlayheadPosition).toBe(12.7);
    });

    it('should provide the playback rate', async () => {
        //Arrange
        const str = new Blob(
            [
                `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <XmlCompilation xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <Id>30c291f0-825c-40ca-a772-b17cdda8f937</Id>
          <MediaPath/>
          <Title>test</Title>
          <Artist/>
          <Album/>
          <Tracks>
            <Track>
              <Id>4dbf78b7-0133-495f-8f71-de69708a9da6</Id>
              <Artist/>
              <PreRoll/>
              <PlaybackRate>1.25</PlaybackRate>,
              <Name>test</Name>
              <Album/>
              <Url>test.mp3</Url>
              <Meter/>
              <UseMeasureNumbers/>
              <Volume>0.5</Volume>
              <Cues/>
            </Track>
          </Tracks>
          <PlaybackMode>PlayTrack</PlaybackMode>
        </XmlCompilation>        `,
            ],
            {
                type: 'text/xml',
            },
        );

        //Act
        const compilation = await CompilationParser.handleAsXmlCompilation(str);

        //Assert
        expect(compilation).toBeDefined();
        expect(compilation.Tracks).toHaveLength(1);
        const firstTrack = compilation.Tracks[0];
        expect(firstTrack.PlaybackRate).toBe(1.25);
    });

    it('should parse the playhead position', () => {
        //Arrange
        const testTrack = new Track(
            'testName',
            'testAlbum',
            'testArtist',
            0,
            15.1,
            DefaultPlaybackRate,
            null,
            null,
            'testUrl',
            'testId',
            new Array<ICue>(),
            new Set<string>(['default-tag']),
            null,
            DefaultTrackVolume,
            null,
        );

        const testCompilation = new Compilation(
            'testMediaPath',
            'testTitle',
            'testArtist',
            'testAlbum',
            'testUrl',
            'testId',
            new Array<ITrack>(testTrack),
            new Set<string>(['default-tag']),
        );

        //Act
        const actual = CompilationParser.convertToXml(testCompilation);

        //Assert
        expect(actual).toContain('<PlayheadPosition>15.1</PlayheadPosition>');
    });

    it('should parse the playback rate', () => {
        //Arrange
        const testTrack = new Track(
            'testName',
            'testAlbum',
            'testArtist',
            0,
            15.1,
            0.75,
            null,
            null,
            'testUrl',
            'testId',
            new Array<ICue>(),
            new Set<string>(['default-tag']),
            null,
            1,
            null,
        );

        const testCompilation = new Compilation(
            'testMediaPath',
            'testTitle',
            'testArtist',
            'testAlbum',
            'testUrl',
            'testId',
            new Array<ITrack>(testTrack),
            new Set<string>(['default-tag']),
        );

        //Act
        const actual = CompilationParser.convertToXml(testCompilation);

        //Assert
        expect(actual).toContain('<PlaybackRate>0.75</PlaybackRate>');
    });
});
