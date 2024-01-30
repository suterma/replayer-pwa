describe('testing the issue "71-a-zip-without-a-compilation-does-not-create-default-tracks" for regression', () => {
    it('should not add a default track when replacing a file', () => {
        cy.loadDemo();
        cy.visit('/#edit');

        // ACT (replace a file)
        // Note: There are currently two media source displays existing, depending on the viewport width. Take the shown one.
        cy.get('[data-cy="media-source"]').filter(':visible').click();
        cy.get('[data-cy="track"] input[data-cy="input-file"]').selectFile(
            'cypress/fixtures/lidija_roos-not_for_sale.mp3',
            { force: true },
        );

        // ASSERT that there is just the expected amount of tracks (no additional default track)
        cy.get('[data-cy="compilation"] [data-cy="track"]').then(($tracks) => {
            cy.wrap($tracks).should('have.length', 1);
        });
    });

    it('should not add a default track when replacing an URL', () => {
        cy.loadMediaUrl(
            'https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );
        cy.visit('/#edit');

        // ACT (replace an URL)
        // Note: There are currently two media source displays existing, depending on the viewport width. Take the shown one.
        cy.get('[data-cy="media-source"]').filter(':visible').click();
        cy.get('[data-cy="track"] [data-cy="input-url"]').type(
            'https://lib.replayer.app/your-light-by-lidija-roos.mp3',
        );
        cy.get('[data-cy="track"] [data-cy="submit-source"]').click();
        // ASSERT that there is just the expected amount of tracks (no additional default track)
        cy.get('[data-cy="compilation"] [data-cy="track"]').then(($tracks) => {
            cy.wrap($tracks).should('have.length', 1);
        });
    });

    it('should add a default track when loading a media resource from an URL', () => {
        cy.loadMediaUrl(
            'https://lib.replayer.app/decisions-by-lidija-roos.ogg',
        );

        // ASSERT that there is a single track and it contains the given source and no cues
        cy.get('[data-cy="compilation"] [data-cy="track"]').then(($tracks) => {
            cy.wrap($tracks).should('have.length', 1);
            cy.wrap($tracks)
                .get('[data-cy="media-source"]')
                .contains(
                    'https://lib.replayer.app/decisions-by-lidija-roos.ogg',
                );
            cy.wrap($tracks).get('[data-cy="cue"]').should('not.exist');
        });
    });

    it('should add a default track when loading a media resource from a media file', () => {
        cy.loadFile('cypress/fixtures/your-light-by-lidija-roos.mp3');

        // ASSERT that there is a single track and it contains the given source and no cues
        cy.get('[data-cy="compilation"] [data-cy="track"]').then(($tracks) => {
            cy.wrap($tracks).should('have.length', 1);
            cy.wrap($tracks)
                .get('[data-cy="media-source"]')
                .contains('your-light-by-lidija-roos.mp3');
            cy.wrap($tracks).get('[data-cy="cue"]').should('not.exist');
        });
    });

    it('should add a default track when loading a media resource from a zipped media file', () => {
        cy.loadFile('cypress/fixtures/your-light-by-lidija-roos.zip');
        cy.visit('/#edit');

        // ASSERT that there is a single track and it contains the given source and no cues
        cy.get('[data-cy="compilation"] [data-cy="track"]').then(($tracks) => {
            cy.wrap($tracks).should('have.length', 1);
            cy.wrap($tracks)
                .get('[data-cy="media-source"]')
                .contains('your-light-by-lidija-roos.mp3');
            cy.wrap($tracks).get('[data-cy="cue"]').should('not.exist');
        });
    });

    it('should not add a default track when loading the demo', () => {
        cy.loadDemo();
        cy.visit('/#edit');

        // ASSERT that there is just the expected amount of tracks (no additional default track)
        cy.get('[data-cy="compilation"] [data-cy="track"]').then(($tracks) => {
            cy.wrap($tracks).should('have.length', 1);
        });
    });

    it('should not add a default track when loading a ZIP compilation', () => {
        cy.loadMediaUrl(
            'https://lib.replayer.app/demo-compilation-featuring-lidija-roos.rez',
        );
        cy.visit('/#edit');

        // ASSERT that there is just the expected amount of tracks (no additional default track)
        cy.get('[data-cy="compilation"] [data-cy="track"]').then(($tracks) => {
            cy.wrap($tracks).should('have.length', 1);
        });
    });

    it('should not add a default track when loading an XML compilation', () => {
        cy.loadFile('cypress/fixtures/2-tracks-with-anechoic-voices.rex');
        cy.visit('/#edit');

        // ASSERT that there is just the expected amount of tracks (no additional default track)
        cy.get('[data-cy="compilation"] [data-cy="track"]').then(($tracks) => {
            cy.wrap($tracks).should('have.length', 2);
        });
    });
});
