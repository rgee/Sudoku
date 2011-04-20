$(document).ready ->
    draw = (proc) ->
        proc.keyboardMode = true

        proc.mousePressed = ()->
        
        proc.keyPressed = ()->
            if @keyboardMode
                str = String.fromCharCode @key
                if not /\D/.test str
                    
