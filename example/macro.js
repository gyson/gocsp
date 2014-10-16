
#import { spawn, <-, -> } from 'gocsp/macro'

spawn {

    <- chan

    if (exp -> chan) {
        // continue

    }

}
