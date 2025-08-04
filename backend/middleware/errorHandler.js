const errorHandler = (err,req,res,next)=>{
    console.error(err.message);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message });
    }

    if (err.code === 11000 || (err.cause && err.cause.code === 11000)) {
        return res.status(409).json({ success: false, message: 'Already exists' });
    }

    return res.status(500).json({ success: false, message: 'Something went wrong on the server' });

}

export default errorHandler;